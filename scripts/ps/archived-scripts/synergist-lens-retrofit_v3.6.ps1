<#
===============================================================================
🔮 The Gnostic Key — Synergist Lens + Navigation Retrofit Utility (v3.9)
-------------------------------------------------------------------------------
Purpose:
  Cleans and rebuilds each scroll’s YAML front matter with:
    • Synergist Lens block  (vaultRefs, crossLinks, etc.)
    • Auto-injected navigation arrays from parent index.11tydata.js
      → episodeParts[] (YAML array)
      → seriesNav[] (YAML array)

Fixes vs v3.5–3.8:
  • Fully removes ANY previous "# 🔗 Auto-injected navigation ..." blocks
  • Also removes stray/legacy episodeParts: / seriesNav: YAML keys
  • Robust conversion from JS-like arrays to valid YAML lists (no commas)
  • Keeps vault-ref parsing intact; idempotent & non-duplicating
===============================================================================
#>

param(
  [string] $Root = "C:\TGK\tgk-site-v3"
)

[int] $added = 0
[int] $refreshed = 0
[int] $skipped = 0
[int] $navInjected = 0

Write-Host "🔍 Scanning scrolls under: $Root/src/pillars" -ForegroundColor Cyan

# =====================================================================
# 🧩 PROCESS SCROLLS
# =====================================================================
Get-ChildItem -Path (Join-Path $Root "src/pillars") -Recurse -Filter "index.md" | ForEach-Object {
  $file = $_.FullName
  $raw  = Get-Content $file -Raw

  # -------------------------------------------------------------------
  # Pull YAML section
  # -------------------------------------------------------------------
  $fmMatch = [regex]::Match($raw, "(?s)^---(.*?)---")
  if (-not $fmMatch.Success) {
    Write-Host "❌ No front matter found → $file" -ForegroundColor Red
    $skipped++
    return
  }

  $fm = $fmMatch.Groups[1].Value
  $body = $raw.Substring($fmMatch.Length)

  # -------------------------------------------------------------------
  # 🔥 HARD-REMOVE any prior auto-injected navigation blocks
  # -------------------------------------------------------------------
  # Remove from marker down to the next blank line before lensEnabled: OR end
  $fm = [regex]::Replace(
    $fm,
    "(?s)#\s*🔗\s*Auto-injected navigation.*?(?=(?:\r?\n\r?\nlensEnabled:)|\Z)",
    "",
    [Text.RegularExpressions.RegexOptions]::IgnoreCase
  ).Trim()

  # -------------------------------------------------------------------
  # Extract IDs from YAML (used in lens block)
  # -------------------------------------------------------------------
  $seriesId  = ([regex]::Match($fm, "seriesId:\s*['""]?([^'\n""]+)")).Groups[1].Value
  $episodeId = ([regex]::Match($fm, "episodeId:\s*['""]?([^'\n""]+)")).Groups[1].Value
  $partId    = ([regex]::Match($fm, "partId:\s*['""]?([^'\n""]+)")).Groups[1].Value

  # -------------------------------------------------------------------
  # 🧠 Extract Vault refs directly from HTML <blockquote>/<cite>
  # -------------------------------------------------------------------
  $pattern = '<cite>.*?<em>([^<]+)</em>.*?href="(/pillars/the-vault/[^"]+)"'
  $seenUrls   = @{}
  $seenTitles = @{}
  $vaultRefs  = @()

  foreach ($m in [regex]::Matches($body, $pattern, 'Singleline')) {
    $title = $m.Groups[1].Value.Trim()
    $url   = $m.Groups[2].Value.Split("#")[0] # strip anchors

    if ($seenUrls.ContainsKey($url) -or $seenTitles.ContainsKey($title)) { continue }

    $seenUrls[$url]     = $true
    $seenTitles[$title] = $true
    $vaultRefs += "  - { title: '$title', path: '$url' }"
  }
  if (-not $vaultRefs -or $vaultRefs.Count -eq 0) { $vaultRefs = @("  []") }

  # -------------------------------------------------------------------
  # Build Synergist Lens block
  # -------------------------------------------------------------------
  $lensBlock = @"
lensEnabled: true

crossLinks: []

vaultRefs:
$($vaultRefs -join "`n")

communityThreads:
  - { id: '${seriesId}-${episodeId}-${partId}', platform: 'tgk-community' }

relatedProducts: []
"@

  # -------------------------------------------------------------------
  # Clean existing keys lines (removes single-line YAML keys)
  # -------------------------------------------------------------------
  $keysToRemove = @(
    "lensEnabled","crossLinks","vaultRefs","communityThreads",
    "relatedProducts","episodeParts","seriesNav"
  )
  $lines = $fm -split "\r?\n"
  $cleanLines = @()
  $skip = $false

  foreach ($line in $lines) {
    $trimmed = $line.TrimStart()
    if ($trimmed -match "^(\w+):") {
      $key = $matches[1]
      $skip = $keysToRemove -contains $key
      if (-not $skip) { $cleanLines += $line }
    } elseif (-not $skip) {
      $cleanLines += $line
    }
  }
  $cleanFM = ($cleanLines -join "`r`n").Trim()

  # -------------------------------------------------------------------
  # 🧭 Inject seriesNav + episodeParts from parent .11tydata.js (clean YAML)
  # -------------------------------------------------------------------
  $episodePartsYaml = ""
  $seriesNavYaml    = ""

  $parentDir  = Split-Path (Split-Path $file -Parent) -Parent
  $parentData = Join-Path $parentDir "index.11tydata.js"

  if (Test-Path $parentData) {
    $parentRaw = Get-Content $parentData -Raw
    $epMatch = [regex]::Match($parentRaw, "(?s)episodeParts\s*:\s*\[(.*?)\]")
    $snMatch = [regex]::Match($parentRaw, "(?s)seriesNav\s*:\s*\[(.*?)\]")

    function Convert-ToYamlList {
      param([string]$arrayBody,[string]$label)
      if (-not $arrayBody) { return "" }

      # Grab each JS object {...} non-greedily
      $objs = [regex]::Matches($arrayBody, "{(.*?)}", "Singleline")
      if ($objs.Count -eq 0) { return "" }

      $out = @("$($label):")
      foreach ($o in $objs) {
        $chunk = $o.Groups[1].Value

        # Match key:value pairs, allowing quoted/unquoted keys, quoted values (which may contain commas)
        $pairs = [regex]::Matches(
          $chunk,
          '(?:"?(\w+)"?\s*:\s*(?:"([^"]*)"|''([^'']*)''|([^,}]+)))',
          "Singleline"
        )

        $out += "  -"
        foreach ($p in $pairs) {
          $key = $p.Groups[1].Value
          $val = if ($p.Groups[2].Success) { $p.Groups[2].Value } elseif ($p.Groups[3].Success) { $p.Groups[3].Value } else { $p.Groups[4].Value.Trim() }
          # normalise whitespace and escape inner quotes
          $val = ($val -replace '\r?\n', ' ') -replace '"', '\"'
          $out += ("    {0}: ""{1}""" -f $key, $val)
        }
      }
      return ($out -join "`r`n")
    }

    if ($epMatch.Success) { $episodePartsYaml = Convert-ToYamlList $epMatch.Groups[1].Value "episodeParts" }
    if ($snMatch.Success) { $seriesNavYaml    = Convert-ToYamlList $snMatch.Groups[1].Value "seriesNav"    }
  }

  $navBlock = ""
  if ($episodePartsYaml -or $seriesNavYaml) {
    $navBlock = "# 🔗 Auto-injected navigation (v3.6)`r`n" +
                $episodePartsYaml + "`r`n`r`n" + $seriesNavYaml + "`r`n"
    $navInjected++
  }

  # -------------------------------------------------------------------
  # Detect presence (for reporting)
  # -------------------------------------------------------------------
  if ($fm -match "(?i)(lensEnabled|vaultRefs|communityThreads|relatedProducts):") {
    Write-Host "⚙️  Refreshed Synergist + Nav → $file" -ForegroundColor Yellow
    $refreshed++
  } else {
    Write-Host "✨ Added Synergist + Nav → $file" -ForegroundColor Green
    $added++
  }

  # -------------------------------------------------------------------
  # Recombine: fresh front matter only once
  # -------------------------------------------------------------------
  $updatedFM = ($cleanFM.TrimEnd() + "`r`n`r`n" + $navBlock + $lensBlock).Trim() + "`r`n"
  $new = "---`r`n$updatedFM---" + $body

  Set-Content -Path $file -Value $new -Encoding UTF8
  Write-Host "✅ Updated: $file" -ForegroundColor Cyan
}

# =====================================================================
# 📈 Summary
# =====================================================================
Write-Host ""
Write-Host "📈 Summary Report" -ForegroundColor Magenta
Write-Host "───────────────────────────────"
Write-Host ("✨ Added/Refreshed : {0}" -f ($added + $refreshed))
Write-Host ("⚙️  Refreshed only : {0}" -f $refreshed)
Write-Host ("📘 Nav Injected    : {0}" -f $navInjected)
Write-Host ("⏭️  Skipped        : {0}" -f $skipped)
Write-Host "───────────────────────────────"
Write-Host "🎯 Retrofit pass complete." -ForegroundColor Green
