param(
  [string] $Root = "C:\TGK\tgk-site-v3"
)

Write-Host "🔍 Scanning for scroll files under: $Root/src/pillars"

# Helper → find Vault references by slug
function Find-VaultRefs($slug, $Root) {
  $vaultRoot = Join-Path $Root "src/pillars/the-vault"
  $matches = @()
  if (Test-Path $vaultRoot) {
    Get-ChildItem -Path $vaultRoot -Recurse -Include "*.md" | ForEach-Object {
      $content = Get-Content $_.FullName -Raw
      if ($content -match $slug) {
        $rel = $_.FullName.Replace($Root, "").Replace("\", "/")
        $matches += "/$rel"
      }
    }
  }
  return $matches
}

# Crawl all scroll parts/episodes
Get-ChildItem -Path (Join-Path $Root "src/pillars") -Recurse -Filter "index.md" | ForEach-Object {
  $file = $_.FullName
  $content = Get-Content $file -Raw

  if ($content -match "^---[\s\S]+?---") {
    $frontMatter = $matches[0]

    # IDs for smarter population
    $seriesId   = if ($frontMatter -match "seriesId:\s*['""]?([^'\n""]+)") { $matches[1] } else { "" }
    $episodeId  = if ($frontMatter -match "episodeId:\s*['""]?([^'\n""]+)") { $matches[1] } else { "" }
    $partId     = if ($frontMatter -match "partId:\s*['""]?([^'\n""]+)") { $matches[1] } else { "" }

    if ($frontMatter -match "lensEnabled:") {
      Write-Host "⚠️ Already has Synergist block: $file → refreshing..."
      $hasBlock = $true
    } else {
      Write-Host "✨ Adding Synergist block → $file"
      $hasBlock = $false
    }

    # Build populated block
    $vaultRefs  = Find-VaultRefs $episodeId $Root | ForEach-Object { "  - { title: 'Vault Match', url: '$_' }" }
    if (-not $vaultRefs) { $vaultRefs = @("  []") }

    $block = @"
lensEnabled: true
crossLinks: []
vaultRefs:
$($vaultRefs -join "`n")
communityThreads:
  - { id: '${seriesId}-${episodeId}-${partId}', platform: 'tgk-community' }
relatedProducts: []
"@

    # Insert or replace
    if ($hasBlock) {
      $updated = $frontMatter -replace "lensEnabled:[\s\S]+?(?=^\S|\Z)", $block
    } else {
      $updated = $frontMatter -replace "(?m)^---\s*$", "$block`r`n---"
    }

    $content = $updated + $content.Substring($frontMatter.Length)
    Set-Content -Path $file -Value $content -Encoding UTF8
    Write-Host "✅ Updated: $file"
  } else {
    Write-Host "❌ No front matter found in: $file (skipped)"
  }
}

Write-Host "🎯 Retrofit + population pass complete."
