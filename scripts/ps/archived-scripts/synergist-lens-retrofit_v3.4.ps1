<#
===============================================================================
🔮 The Gnostic Key — Synergist Lens + Navigation Retrofit Utility (v3.5)
-------------------------------------------------------------------------------
Purpose:
  Cleans and rebuilds each scroll’s YAML front matter with:
    • Synergist Lens block  (vaultRefs, crossLinks, etc.)
    • Auto-injected navigation arrays from parent index.11tydata.js
      → episodeParts[]
      → seriesNav[]

Key Improvements (v3.5):
  • Parses <cite><em>Title</em></cite> Vault refs from scroll bodies
  • Adds automatic navigation injection from parent .11tydata.js
  • Avoids duplicate keys (lensEnabled, vaultRefs, episodeParts, seriesNav)
  • Adds progress counters for all actions
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
  # Extract IDs from YAML
  # -------------------------------------------------------------------
  $seriesId  = ([regex]::Match($fm, "seriesId:\s*['""]?([^'\n""]+)")).Groups[1].Value
  $episodeId = ([regex]::Match($fm, "episodeId:\s*['""]?([^'\n""]+)")).Groups[1].Value
  $partId    = ([regex]::Match($fm, "partId:\s*['""]?([^'\n""]+)")).Groups[1].Value

  # -------------------------------------------------------------------
  # 🧠 Extract Vault refs directly from HTML <blockquote>/<cite>
  # -------------------------------------------------------------------
  $pattern = '<cite>.*?<em>([^<]+)</em>.*?href="(/pillars/the-vault/[^"]+)"'
  $seenUrls = @{}
  $seenTitles = @{}
  $vaultRefs = @()

  foreach ($m in [regex]::Matches($body, $pattern, 'Singleline')) {
    $title = $m.Groups[1].Value.Trim()
    $url   = $m.Groups[2].Value.Split("#")[0] # strip anchors

    if ($seenUrls.ContainsKey($url) -or $seenTitles.ContainsKey($title)) { continue }

    $seenUrls[$url]   = $true
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
  # Clean existing keys
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
    }
    elseif (-not $skip) { $cleanLines += $line }
  }
  $cleanFM = ($cleanLines -join "`r`n").TrimEnd()

  # -------------------------------------------------------------------
  # 🧭 Inject seriesNav + episodeParts from parent .11tydata.js
  # -------------------------------------------------------------------
  $episodePartsBlock = ""
  $seriesNavBlock    = ""

  $parentDir  = Split-Path (Split-Path $file -Parent) -Parent
  $parentData = Join-Path $parentDir "index.11tydata.js"

  if (Test-Path $parentData) {
    $parentRaw = Get-Content $parentData -Raw
    $epMatch = [regex]::Match($parentRaw, "(?s)episodeParts\s*:\s*\[(.*?)\]")
    $snMatch = [regex]::Match($parentRaw, "(?s)seriesNav\s*:\s*\[(.*?)\]")

    if ($epMatch.Success) {
      $episodePartsBlock = "episodeParts: |`r`n" + (
        $epMatch.Groups[1].Value.Trim() -replace "^", "  "
      )
    }
    if ($snMatch.Success) {
      $seriesNavBlock = "seriesNav: |`r`n" + (
        $snMatch.Groups[1].Value.Trim() -replace "^", "  "
      )
    }
  }

  $navBlock = ""
  if ($episodePartsBlock -or $seriesNavBlock) {
    $navBlock = "# 🔗 Auto-injected navigation (v3.5)`r`n" +
                "$episodePartsBlock`r`n`r`n$seriesNavBlock`r`n"
    $navInjected++
  }

  # -------------------------------------------------------------------
  # Detect block presence (for reporting)
  # -------------------------------------------------------------------
  if ($fm -match "(?i)(lensEnabled|vaultRefs|communityThreads|relatedProducts):") {
    Write-Host "⚙️  Refreshed Synergist + Nav → $file" -ForegroundColor Yellow
    $refreshed++
  } else {
    Write-Host "✨ Added Synergist + Nav → $file" -ForegroundColor Green
    $added++
  }

  # -------------------------------------------------------------------
  # Recombine: clean front matter + navigation + lens
  # -------------------------------------------------------------------
  $updatedFM = ($cleanFM.TrimEnd() + "`r`n`r`n" + $navBlock + $lensBlock).Trim() + "`r`n"
  $new = "---`r`n$updatedFM---" + $body
  Set-Content -Path $file -Value $new -Encoding UTF8
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
