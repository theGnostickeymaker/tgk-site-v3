<#
===============================================================================
🔮 The Gnostic Key — Synergist Lens Retrofit Utility (v3.4)
-------------------------------------------------------------------------------
Purpose:
  Removes all prior Synergist Lens fragments and writes exactly
  one clean, formatted block into each page's YAML front matter.
  Now intelligently extracts Vault links from <blockquote>/<cite> HTML in page bodies.

Main Updates (v3.4):
  • Parses <a href="/pillars/the-vault/..."> inside page bodies.
  • Extracts <em>Title</em> text from <cite> for human-readable vaultRefs.
  • Drops unused Find-VaultRefs() scan (now body-based, not vault-based).
  • Retains all prior safety and idempotent cleanup logic.
===============================================================================
#>

param(
  [string] $Root = "C:\TGK\tgk-site-v3"
)

[int] $added = 0
[int] $refreshed = 0
[int] $skipped = 0

Write-Host "🔍 Scanning for page files under: $Root/src/pillars" -ForegroundColor Cyan

# =====================================================================
# 🧩 PROCESS Pages
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

  # -------------------------------------------------------------------
  # Extract IDs from YAML
  # -------------------------------------------------------------------
  $seriesId  = ([regex]::Match($fm, "seriesId:\s*['""]?([^'\n""]+)")).Groups[1].Value
  $episodeId = ([regex]::Match($fm, "episodeId:\s*['""]?([^'\n""]+)")).Groups[1].Value
  $partId    = ([regex]::Match($fm, "partId:\s*['""]?([^'\n""]+)")).Groups[1].Value

  # -------------------------------------------------------------------
  # 🧠 NEW: Extract Vault refs directly from HTML <blockquote> citations
  # -------------------------------------------------------------------
  $body = $raw.Substring($fmMatch.Length)

  $pattern = '<cite>.*?<em>([^<]+)</em>.*?href="(/pillars/the-vault/[^"]+)"'
$seenUrls   = @{}
$seenTitles = @{}
$vaultRefs  = @()

foreach ($m in [regex]::Matches($body, $pattern, 'Singleline')) {
  $title = $m.Groups[1].Value.Trim()
  $url   = $m.Groups[2].Value

  # Remove anchor fragments (e.g., #thomas-70 → clean base URL)
  if ($url -match "#") { $url = $url.Split("#")[0] }

  # Skip if this URL or Title already processed
  if ($seenUrls.ContainsKey($url) -or $seenTitles.ContainsKey($title)) {
    continue
  }

  # Store in seen-hash
  $seenUrls[$url]   = $true
  $seenTitles[$title] = $true

  # Append clean YAML line
  $vaultRefs += "  - { title: '$title', path: '$url' }"
}

if (-not $vaultRefs -or $vaultRefs.Count -eq 0) {
  $vaultRefs = @("  []")
}

  # -------------------------------------------------------------------
  # Construct clean Lens block
  # -------------------------------------------------------------------
  $block = @"
lensEnabled: true

crossLinks: []

vaultRefs:
$($vaultRefs -join "`n")

communityThreads:
  - { id: '${seriesId}-${episodeId}-${partId}', platform: 'tgk-community' }

relatedProducts: []

"@

  # -------------------------------------------------------------------
  # Clean existing Synergist keys line-by-line
  # -------------------------------------------------------------------
  $keysToRemove = @("lensEnabled", "crossLinks", "vaultRefs", "communityThreads", "relatedProducts")

  $lines = $fm -split "\r?\n"
  $cleanLines = @()
  $skip = $false

  foreach ($line in $lines) {
    $trimmed = $line.TrimStart()
    if ($trimmed -match "^(\w+):") {
      $key = $matches[1]
      if ($keysToRemove -contains $key) {
        $skip = $true
      } else {
        $skip = $false
        $cleanLines += $line
      }
    } elseif (-not $skip) {
      $cleanLines += $line
    }
  }

  $cleanFM = ($cleanLines -join "`r`n").TrimEnd()

  # -------------------------------------------------------------------
  # Detect existing block presence (any of the keys)
  # -------------------------------------------------------------------
  if ($fm -match "(?i)(lensEnabled|crossLinks|vaultRefs|communityThreads|relatedProducts):") {
    Write-Host "⚙️ Replaced Synergist block → $file" -ForegroundColor Yellow
    $refreshed++
  } else {
    Write-Host "✨ Added Synergist block → $file" -ForegroundColor Green
    $added++
  }

  # -------------------------------------------------------------------
  # Recombine: fresh front matter only once
  # -------------------------------------------------------------------
  $updatedFM = ($cleanFM.TrimEnd() + "`r`n`r`n" + $block).Trim() + "`r`n"
  $new = "---`r`n$updatedFM---" + $body

  Set-Content -Path $file -Value $new -Encoding UTF8
  Write-Host "✅ Updated: $file" -ForegroundColor Cyan
}

# =====================================================================
# 🧾 Summary
# =====================================================================
Write-Host ""
Write-Host "📈 Summary Report" -ForegroundColor Magenta
Write-Host "───────────────────────────────"
Write-Host ("✨ Added      : {0}" -f $added)
Write-Host ("⚙️ Replaced   : {0}" -f $refreshed)
Write-Host ("⏭️ Skipped    : {0}" -f $skipped)
Write-Host "───────────────────────────────"
Write-Host "🎯 Retrofit pass complete." -ForegroundColor Green
