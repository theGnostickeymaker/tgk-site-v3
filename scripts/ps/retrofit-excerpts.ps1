<#
===============================================================================
🧠 TGK ShareImage + Excerpt Retrofit (v1.3)
Purpose:
  • Ensures every scroll front matter has correct socialImage + socialImages block.
  • Creates the expected share-image folder tree under /tgk-assets/images/share/.
  • Optionally injects/updates excerpts as before.
Usage:
  .\retrofit-shareimages.ps1                      # Update all
  .\retrofit-shareimages.ps1 -Series "the-afterlife"
  .\retrofit-shareimages.ps1 -Series "the-afterlife" -Episode "ancient-egypt"
===============================================================================
#>

param(
  [string]$Root = "C:\TGK\tgk-site-v3",
  [string]$Series = "",
  [string]$Episode = ""
)

[int]$updated = 0
[int]$foldered = 0
Write-Host "🔍 Starting TGK ShareImage Retrofit (v1.3)" -ForegroundColor Cyan
Write-Host "Root path: $Root" -ForegroundColor Cyan
if ($Series) { Write-Host "Target Series: $Series" -ForegroundColor Yellow }
if ($Episode) { Write-Host "Target Episode: $Episode" -ForegroundColor Yellow }

# --- search base ---
$searchBase = Join-Path $Root "src\pillars"
if ($Series) {
  $searchBase = Join-Path $searchBase "the-teachings\$Series"
  if ($Episode) { $searchBase = Join-Path $searchBase "series-1\$Episode" }
} else { $searchBase = Join-Path $searchBase "the-teachings" }
Write-Host "Search path: $searchBase" -ForegroundColor DarkGray

# --- helpers ---
function Get-ExcerptFromBody([string]$body) {
  if ([string]::IsNullOrWhiteSpace($body)) { return $null }
  $clean = $body `
    -replace '(?s){%.*?%}', '' `
    -replace '(?s)<!--.*?-->', '' `
    -replace '(?s)<blockquote.*?</blockquote>', '' `
    -replace '(?s)<h[1-6].*?</h[1-6]>', ''
  $para = [regex]::Match($clean, '(?s)<p>(.*?)</p>')
  if (-not $para.Success) { return $null }
  $text = $para.Groups[1].Value -replace '<[^>]+>', ''
  $text = [System.Net.WebUtility]::HtmlDecode($text).Trim()
  if ($text.Length -gt 200) { $text = $text.Substring(0,200) + '…' }
  return $text
}

function Ensure-Dir($Path) {
  if (!(Test-Path -LiteralPath $Path)) { New-Item -ItemType Directory -Path $Path -Force | Out-Null }
}

# --- main loop ---
Get-ChildItem -Path $searchBase -Recurse -Filter "index.md" -ErrorAction SilentlyContinue | ForEach-Object {
  $file = $_.FullName
  try {
    $raw = Get-Content $file -Raw
    if ($raw -notmatch '(?s)^---(.*?)---') { return }
    $fm = $matches[1]; $body = $raw.Substring($matches[0].Length)

    # Extract keys for folder paths
    $PillarSlug = "the-teachings"
    $SeriesSlug = if ($Series) { $Series } else { ($_ -split "the-teachings\\")[1] -split "\\" | Select-Object -First 1 }
    if ($fm -match 'series:\s*"([^"]+)"') { $SeriesSlug = $matches[1] }
    if ($fm -match 'episodeId:\s*"([^"]+)"') { $EpisodeSlug = $matches[1] }
    elseif ($file -match 'series-\d\\([^\\]+)\\part-\d\\index\.md$') { $EpisodeSlug = $matches[1] }
    else { $EpisodeSlug = "unknown" }

    if ($file -match 'series-(\d)\\') { $SeriesNo = $matches[1] } else { $SeriesNo = 1 }
    if ($file -match '(part-\d)\\index\.md$') { $PartSlug = $matches[1] } else { $PartSlug = "part-1" }

    # Determine expected image path (series-aware)
    $relPath = "/tgk-assets/images/share/$PillarSlug/$SeriesSlug/series-$SeriesNo/$EpisodeSlug/$PartSlug"
    $baseImage = "$relPath/$EpisodeSlug-$PartSlug.jpg"

    # Inject / replace socialImage
    if ($fm -match '(?m)^socialImage:') {
      $fm = [regex]::Replace($fm, '(?m)^socialImage:.*$', "socialImage: `"$baseImage`"")
    } else {
      $fm = $fm.TrimEnd() + "`n`nsocialImage: `"$baseImage`""
    }

    # Ensure full socialImages block
    if ($fm -notmatch '(?m)^socialImages:') {
      $block = @"
socialImages:
  x: "$($baseImage -replace '\.jpg$', '@x.jpg')"
  square: "$($baseImage -replace '\.jpg$', '@square.jpg')"
  portrait: "$($baseImage -replace '\.jpg$', '@portrait.jpg')"
  story: "$($baseImage -replace '\.jpg$', '@story.jpg')"
  hero: "$($baseImage -replace '\.jpg$', '@2x.jpg')"
"@
      $fm = $fm + "`n" + $block
    }

    # Optional excerpt refresh (YAML safe: escape double quotes)
    $excerpt = Get-ExcerptFromBody $body
    if ($excerpt) {
      $escaped = $excerpt -replace '"','\"'
      if ($fm -match '(?m)^excerpt:') {
        $fm = [regex]::Replace($fm, '(?m)^excerpt:.*$', "excerpt: `"$escaped`"")
      } else {
        $fm = $fm.TrimEnd() + "`nexcerpt: `"$escaped`""
      }
    }

    # Re-write file safely
    $new = "---`n$fm`n---$body"
    Set-Content -Path $file -Value $new -Encoding UTF8NoBOM
    $updated++
    Write-Host "✅ Updated front matter → $file" -ForegroundColor Green

    # 🖼 Create folder structure for images
    $shareFolder = Join-Path $Root "src\tgk-assets\images\share\$PillarSlug\$SeriesSlug\series-$SeriesNo\$EpisodeSlug\$PartSlug"
    Ensure-Dir $shareFolder
    $variants = @("", "@x", "@square", "@portrait", "@story", "@2x")
    foreach ($suffix in $variants) {
      $p = Join-Path $shareFolder "$EpisodeSlug-$PartSlug$suffix.jpg"
      if (-not (Test-Path $p)) {
        [System.IO.File]::WriteAllBytes($p,[byte[]]@())
        Write-Host "📂 Created → $p" -ForegroundColor DarkGray
        $foldered++
      }
    }
  }
  catch {
    Write-Host "⚠️ Error processing $file : $_" -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "📘 Front matters updated: $updated" -ForegroundColor Magenta
Write-Host "📂 Share folders prepared: $foldered" -ForegroundColor Magenta
Write-Host "🎯 Done." -ForegroundColor Green

