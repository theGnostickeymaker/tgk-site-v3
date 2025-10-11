<# ======================================================================
  TGK — update-seriesnav-auto.ps1  (v1.3 — streamlined)
  Purpose:
    Auto-builds a clean `seriesNav` array for every episode folder inside a
    series (e.g. series-1). Pulls title from index.njk front matter and
    tagline from each episode's index.11tydata.js.

  Updates in this version:
    ✅ Uses index.11tydata.js only (TGK v2.6 structure)
    ✅ Null-safe title capitalization (no more morning errors)
    ✅ Skips hidden/system folders (_assets, .gitkeep, etc.)
    ✅ Clear, quiet, coffee-friendly logging
====================================================================== #>

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)] [string] $Root,        # e.g. "C:\TGK\tgk-site-v3"
  [Parameter(Mandatory = $true)] [string] $PillarSlug,  # e.g. "the-teachings"
  [Parameter(Mandatory = $true)] [string] $SeriesSlug,  # e.g. "the-afterlife"
  [Parameter(Mandatory = $true)] [int]    $SeriesNo     # e.g. 1
)

Write-Host ""
Write-Host "🧭 TGK SeriesNav Auto-Updater (v1.3)"
Write-Host "   Target: $PillarSlug / $SeriesSlug / series-$SeriesNo"
Write-Host ""

# ----------------------------- Paths -----------------------------------
$seriesRoot = Join-Path $Root "src\pillars\$PillarSlug\$SeriesSlug\series-$SeriesNo"
if (!(Test-Path $seriesRoot)) {
  Write-Host "❌ Path not found: $seriesRoot"
  exit 1
}

# ----------------------------- Helpers ---------------------------------
function Get-FrontMatter {
  param([string]$FilePath)
  if (!(Test-Path $FilePath)) { return $null }
  $raw = Get-Content $FilePath -Raw
  if ($raw -match '(?s)^---\s*(.*?)\s*---') { return $Matches[1] }
  return $null
}

function YamlVal {
  param([string]$yaml, [string]$key)
  if (-not $yaml) { return $null }
  $rx = "(?m)^\s*$([regex]::Escape($key))\s*:\s*""?([^`"\r\n]+)""?"
  $m  = [regex]::Match($yaml, $rx)
  if ($m.Success) { return $m.Groups[1].Value.Trim() }
  return $null
}

# ----------------------------- Step 1: Collect episodes ----------------
$episodes = @()

Get-ChildItem -Path $seriesRoot -Directory |
  Where-Object { $_.Name -notmatch '^[\._]' } |  # ignore hidden/system dirs
  ForEach-Object {

    $episodeDir = $_.FullName
    $slug       = $_.Name
    $url        = "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$slug/"
    $indexNjk   = Join-Path $episodeDir "index.njk"
    $dataJs     = Join-Path $episodeDir "index.11tydata.js"  # 🔹 TGK v2.6 format

    if ([string]::IsNullOrWhiteSpace($slug)) {
      Write-Warning "⚠️  Skipping folder with no valid slug: $($_.FullName)"
      return
    }

    # --- Title ---
    $title = ($slug -replace '-', ' ')
    if (-not [string]::IsNullOrWhiteSpace($title)) {
      $title = ($title -replace '\b(\w)', {
        if ($args[0].Value) { $args[0].Value.ToUpper() } else { $args[0].Value }
      })
    } else { $title = "Untitled Episode" }

    $desc = "Three-part journey through remembrance and return."
    $episodeNo = $null

    # --- Front matter title + episode ---
    $fm = Get-FrontMatter -FilePath $indexNjk
    if ($fm) {
      $titleFromFm   = YamlVal $fm 'title'
      $episodeFromFm = YamlVal $fm 'episode'
      if ($titleFromFm)   { $title = $titleFromFm }
      if ($episodeFromFm) { [int]$episodeNo = $episodeFromFm }
    }

    # --- Tagline from index.11tydata.js ---
    if (Test-Path $dataJs) {
      $js = Get-Content $dataJs -Raw
      $m  = [regex]::Match($js, '(?m)^\s*tagline:\s*"([^"]+)"')
      if ($m.Success) { $desc = $m.Groups[1].Value.Trim() }
    } else {
      Write-Warning "⚠️  Missing index.11tydata.js in: $episodeDir"
    }

    $episodes += [PSCustomObject]@{
      Title = $title
      Desc  = $desc
      Url   = $url
      Order = $(if ($episodeNo -ne $null) { $episodeNo } else { [int]::MaxValue })
    }
  }

if (-not $episodes.Count) {
  Write-Host "⚠️  No valid episodes found under: $seriesRoot"
  exit
}

# Sort and display
$episodes = $episodes | Sort-Object Order, Title
Write-Host "📋 Episodes detected:`n"
$episodes | Format-Table Title, Url | Out-String | Write-Host

# ----------------------------- Step 2: Build seriesNav -----------------
$navLines = $episodes | ForEach-Object {
  "    { title: `"$($_.Title)`", desc: `"$($_.Desc)`", url: `"$($_.Url)`" }"
}

$seriesNav = @"
  seriesNav: [
$($navLines -join ",`n")
  ],
"@

Write-Host "`n🧩 Generated seriesNav block:`n$seriesNav"

# ----------------------------- Step 3: Update each episode -------------
Get-ChildItem -Path $seriesRoot -Directory |
  Where-Object { $_.Name -notmatch '^[\._]' } |
  ForEach-Object {
    $episodeDir = $_.FullName
    $file       = Join-Path $episodeDir "index.11tydata.js"

    if (Test-Path $file) {
      $content = Get-Content $file -Raw

      if ($content -match 'seriesNav\s*:\s*\[') {
        $updated = $content -replace '(?ms)seriesNav\s*:\s*\[.*?\],', $seriesNav
        Write-Host "🔁 Updated → $file"
      } elseif ($content -match '(?ms)(episodeParts\s*:\s*\[.*?\],)') {
        $updated = $content -replace '(?ms)(episodeParts\s*:\s*\[.*?\],)', "`$1`n$seriesNav"
        Write-Host "➕ Injected → $file"
      } else {
        $updated = $content -replace '(?s)\}\s*;\s*$', "$seriesNav`n};"
        Write-Host "➕ Appended → $file"
      }

      Set-Content -Path $file -Value $updated -Encoding UTF8
    } else {
      Write-Warning "⚠️  Missing index.11tydata.js for: $($_.FullName)"
    }
  }

Write-Host "`n✅ All episode index.11tydata.js files synced successfully."
