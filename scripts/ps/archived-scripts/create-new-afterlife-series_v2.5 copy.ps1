<# ======================================================================
  TGK — create-new-afterlife-series_v2.5.ps1
  Purpose: Generate Afterlife Series scaffolding + Synergist Lens + Quiz + Media
  Fixes: grid append, episode index files, quiz index, overwrite safety, synergy
  Version: 2.5 (2025-10-09)
====================================================================== #>

[CmdletBinding()]
param(
  # ===== Required identifiers =====
  [Parameter(Mandatory=$true)] [string] $PillarSlug,   # e.g., the-teachings
  [Parameter(Mandatory=$true)] [string] $SeriesSlug,   # e.g., the-afterlife
  [Parameter(Mandatory=$true)] [int]    $SeriesNo,     # e.g., 1
  [Parameter(Mandatory=$true)] [string] $Slug,         # episode slug, e.g., sufi-islam
  [Parameter(Mandatory=$true)] [string] $Title,        # episode title
  [Parameter(Mandatory=$true)] [int]    $Episode,      # episode number

  # ===== Display / content =====
  [ValidateSet('free','initiate','full','paid')] 
  [string] $Tier = 'free',
  [string] $Glyph = '⛪︎',
  [string] $BodyClass = 'gold',
  [int]    $SeriesVersion = 1,
  [string] $LandingDescription = "Three-part journey.",
  [string] $Root = '.',

  # ===== Feature flags =====
  [switch] $WithQuizzes,
  [switch] $WithImages,
  [switch] $Quick,              # skip synergy rebuild
  [switch] $LensOnly,           # only rebuild synergy map

  # ===== Safety =====
  [switch] $ConfirmOverwrite,   # backup .bak then overwrite existing files
  [switch] $Force               # overwrite without backup
)

# ----------------------------- Colors -----------------------------------
if (-not $PSStyle) { $PSStyle = [PSCustomObject]@{ Foreground = @{}; Reset = "" } }

function Info ($msg){ Write-Host "• $msg" }
function Done ($msg){ Write-Host "$($PSStyle.Foreground.BrightGreen)✔$($PSStyle.Reset) $msg" }
function Warn ($msg){ Write-Warning "$msg" }
function Err  ($msg){ Write-Error   "$msg" }

# ----------------------------- Helpers ----------------------------------
function Ensure-Dir([string]$Path) {
  if (!(Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path | Out-Null
  }
}

function Write-Utf8File {
  param([string]$Path, [string]$Content)
  $dir = Split-Path -Parent $Path
  if ($dir) { Ensure-Dir $dir }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Write-FileSafely {
  param(
    [Parameter(Mandatory=$true)][string]$Path,
    [Parameter(Mandatory=$true)][string]$Content,
    [switch]$ConfirmOverwrite,
    [switch]$Force
  )
  $exists = Test-Path -LiteralPath $Path
  if ($exists -and -not $Force -and -not $ConfirmOverwrite) {
    Warn "SKIP (exists): $Path (use -ConfirmOverwrite to backup+overwrite, or -Force to overwrite)"
    return $false
  }
  if ($exists -and $ConfirmOverwrite -and -not $Force) {
    $bak = "$Path.bak.$((Get-Date).ToString('yyyyMMdd-HHmmss'))"
    Copy-Item -LiteralPath $Path -Destination $bak -Force
    Info "Backed up existing → $bak"
  }
  Write-Utf8File -Path $Path -Content $Content
  if ($exists) { Info "Overwrote: $Path" } else { Info "Wrote: $Path" }
  return $true
}

function Yaml-Escape([string]$s) {
  if ([string]::IsNullOrWhiteSpace($s)) { return "" }
  if ($s -match "[:#\-\?\[\]\{\},&\*!\|>'" + '"' + "%@`"]") { return '"' + ($s -replace '"','\"') + '"' }
  return $s
}

function To-Roman([int]$n) {
  switch ($n) {
    1 {'I'} 2 {'II'} 3 {'III'} 4 {'IV'} 5 {'V'} 6 {'VI'}
    default { throw "Roman range limited for Afterlife parts: 1..3" }
  }
}
function Part-Slug([int]$n) { "part-$n" }
function Part-Id([int]$n)   { "part$n"  }

# ---------------------- Paths & IDs -------------------------------------
$SRC_ROOT      = Join-Path $Root "src"
$PILLAR_DIR    = Join-Path $SRC_ROOT "pillars\$PillarSlug"
$SERIES_GROUP  = Join-Path $PILLAR_DIR "$SeriesSlug"                          # e.g. ...\pillars\the-teachings\the-afterlife
$SERIES_DIR    = Join-Path $SERIES_GROUP "series-$SeriesNo"                   # e.g. ...\series-1
$EPISODE_DIR   = Join-Path $SERIES_DIR "$Slug"                                # e.g. ...\sufi-islam
$QUIZ_ROOT     = Join-Path $SRC_ROOT "_data\quiz"
$QUIZ_SERIES   = Join-Path $QUIZ_ROOT "$PillarSlug\$SeriesSlug\series-$SeriesNo"
$QUIZ_INDEX    = Join-Path $QUIZ_ROOT "index.js"
$MEDIA_ROOT    = Join-Path $SRC_ROOT "media\$PillarSlug\$SeriesSlug\series-$SeriesNo\$Slug"

$seriesId  = "$SeriesSlug-s$SeriesNo"    # the-afterlife-s1
$episodeId = $Slug                        # sufi-islam

# ========================== Synergy Builder =============================
class SynergyNode {
  [string]$id; [string]$title; [string]$url; [string]$pillar; [string]$series
  [string]$episode; [string]$part; [string]$tier; [string]$type
}
class SynergyEdge { [string]$source; [string]$target; [string]$relation }

function Build-SynergyMap {
  param([Parameter(Mandatory)][string]$Root)
  $src    = Join-Path $Root "src"
  $outDir = Join-Path $src "_data"
  Ensure-Dir $outDir
  $outFile = Join-Path $outDir "synergyMap.json"

  $nodes = New-Object System.Collections.Generic.List[SynergyNode]
  $edges = New-Object System.Collections.Generic.List[SynergyEdge]

  $mdFiles = Get-ChildItem -Path (Join-Path $src "pillars") -Recurse -Filter "index.md" -ErrorAction SilentlyContinue
  foreach ($f in $mdFiles) {
    $raw = Get-Content $f.FullName -Raw
    if ($raw -notmatch '(?s)^---\s*(.*?)\s*---') { continue }
    $yaml = [regex]::Match($raw, '(?s)^---\s*(.*?)\s*---').Groups[1].Value

    function YGet([string]$key) {
      $pattern = "(?m)^\s*$key\s*:\s*(.+)$"
      $match = [regex]::Match($yaml, $pattern)
      if ($match.Success) { return ($match.Groups[1].Value.Trim()) }
      else { return $null }
    }

    $title     = (YGet "title")     -replace '^"|"$',''
    $permalink = (YGet "permalink") -replace '^"|"$',''
    $pillar    = (YGet "pillar")    -replace '^"|"$',''
    $series    = (YGet "series")    -replace '^"|"$',''
    $tier      = (YGet "tier")      -replace '^"|"$',''
    $scrollId  = (YGet "scrollId")  -replace '^"|"$',''
    $episodeIdY= (YGet "episodeId") -replace '^"|"$',''
    $partIdY   = (YGet "partId")    -replace '^"|"$',''
    if (-not $scrollId) { $scrollId = $permalink }

    $node = [SynergyNode]::new()
    $node.id=$scrollId; $node.title=$title; $node.url=$permalink
    $node.pillar=$pillar; $node.series=$series
    $node.episode=$episodeIdY; $node.part=$partIdY
    $node.tier=$tier; $node.type="scroll"
    $nodes.Add($node) | Out-Null

    function Extract-Array([string]$name) {
      if ($yaml -match "(?ms)^\s*$([regex]::Escape($name))\s*:\s*\[(.*?)\]") {
        $inner = $Matches[2]; $items=@()
        foreach ($m in ([regex]::Matches($inner, '"([^"]+)"'))) { $items += $m.Groups[1].Value }
        return ,$items
      } elseif ($yaml -match "(?ms)^\s*$([regex]::Escape($name))\s*:\s*-(.+)") {
        $start = $yaml.IndexOf("${name}:")
        $block = $yaml.Substring($start)
        $list=@()
        foreach ($line in $block.Split("`n")) {
          if ($line -match '^\s*-\s*"([^"]+)"') { $list += $Matches[1] }
          elseif ($line -match '^\s*-\s*(/[\w\-/]+)') { $list += ($line.Trim() -replace '^\s*-\s*','') }
          elseif ($line -match '^\S') { break }
        }
        return ,($list | Where-Object { $_ })
      }
      return @()
    }

    foreach ($t in (Extract-Array "crossLinks"))     { $edges.Add([SynergyEdge]@{source=$node.id; target=$t; relation="crossLink"}) | Out-Null }
    foreach ($t in (Extract-Array "vaultRefs"))      { $edges.Add([SynergyEdge]@{source=$node.id; target=$t; relation="vaultRef"})  | Out-Null }
    foreach ($t in (Extract-Array "communityThreads")){ $edges.Add([SynergyEdge]@{source=$node.id; target=$t; relation="community"}) | Out-Null }
    foreach ($t in (Extract-Array "relatedProducts")) { $edges.Add([SynergyEdge]@{source=$node.id; target=$t; relation="product"})   | Out-Null }
  }

  $payload = [ordered]@{
    generatedAt = (Get-Date).ToString("s")
    nodes = $nodes
    edges = $edges
  } | ConvertTo-Json -Depth 6

  Write-Utf8File -Path $outFile -Content $payload
  Done "Synergy map written: $outFile"
}

# ======================= Grid Updaters (JS object inject) ===============
function AddCardToGrid {
  param(
    [Parameter(Mandatory=$true)][string]$DataFile,
    [Parameter(Mandatory=$true)][string]$CardBlock,  # already formatted JS object with trailing comma
    [Parameter(Mandatory=$true)][string]$Key,        # unique href to detect
    [ValidateSet('pillar','series','episode')] [string]$Scope = 'pillar'
  )
  if (!(Test-Path -LiteralPath $DataFile)) { Warn "Grid skip (no file): $DataFile"; return }

  $content = Get-Content $DataFile -Raw

  # If already contains href, bail
  if ($content -match [regex]::Escape($Key)) { Info "Grid already contains $Key"; return }

  # Try function-style: pillarGrid: () => ([ ... ])
  $patternFunc = 'pillarGrid\s*:\s*\(\)\s*=>\s*\(\['
  # Try array-style: pillarGrid: [
  $patternArr  = 'pillarGrid\s*:\s*\['

  if ($content -match $patternFunc) {
    $content = $content -replace '(pillarGrid\s*:\s*\(\)\s*=>\s*\(\[[^\]]*)\]', "`$1`n$CardBlock]"
    Write-FileSafely -Path $DataFile -Content $content -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force | Out-Null
    Done "Appended card → $DataFile (func)"
    return
  }
  if ($content -match $patternArr) {
    $content = $content -replace $patternArr, ("pillarGrid: [" + "`n" + $CardBlock)
    Write-FileSafely -Path $DataFile -Content $content -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force | Out-Null
    Done "Appended card → $DataFile (array)"
    return
  }

  # No pillarGrid present: create it
  $insert = @"
  
  pillarGrid: [
$CardBlock  ],
"@
  $content = $content -replace 'export\s+default\s*\{', "export default {$insert"
  Write-FileSafely -Path $DataFile -Content $content -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force | Out-Null
  Done "Created pillarGrid and appended → $DataFile"
}

function Update-PillarGridGroup {
  param(
    [Parameter(Mandatory=$true)][string]$DataFile,
    [Parameter(Mandatory=$true)][string]$Title,
    [Parameter(Mandatory=$true)][string]$Href,
    [string]$Glyph = "☥",
    [string]$Desc = "Maps of death, rebirth, and remembrance across traditions.",
    [string]$Tier = "free",
    [string]$State = "default"
  )
  $card = @"
    {
      href: "$Href",
      title: "$Title",
      glyph: "$Glyph",
      desc: "$Desc",
      tier: "$Tier",
      state: "$State"
    },
"@
  AddCardToGrid -DataFile $DataFile -CardBlock $card -Key $Href -Scope 'pillar'
}

function Update-SeriesGrid {
  param(
    [Parameter(Mandatory=$true)][string]$DataFile,
    [Parameter(Mandatory=$true)][string]$Title,
    [Parameter(Mandatory=$true)][string]$Href,
    [string]$Glyph = "✝",
    [string]$Tagline = "",
    [string]$Tier = "free",
    [string]$State = "default"
  )
  $card = @"
    {
      href: "$Href",
      title: "$Title",
      glyph: "$Glyph",
      tagline: "$Tagline",
      tier: "$Tier",
      state: "$State"
    },
"@
  AddCardToGrid -DataFile $DataFile -CardBlock $card -Key $Href -Scope 'series'
}

function Update-EpisodeGrid {
  param(
    [Parameter(Mandatory=$true)][string]$DataFile,
    [Parameter(Mandatory=$true)][string]$Title,
    [Parameter(Mandatory=$true)][string]$Href,
    [string]$Glyph = "✝",
    [string]$Tagline = "",
    [string]$Tier = "free",
    [string]$State = "default"
  )
  $card = @"
    {
      href: "$Href",
      title: "$Title",
      glyph: "$Glyph",
      tagline: "$Tagline",
      tier: "$Tier",
      state: "$State"
    },
"@
  AddCardToGrid -DataFile $DataFile -CardBlock $card -Key $Href -Scope 'episode'
}

# ============================ Lens Only =================================
if ($LensOnly.IsPresent) {
  Info "⚯ Rebuilding synergy map only (site-wide)…"
  Build-SynergyMap -Root $Root
  exit 0
}

Write-Host ""
Write-Host "$($PSStyle.Foreground.BrightCyan)⛭ TGK Afterlife Generator 2.5$($PSStyle.Reset)"
Write-Host "   Pillar: $PillarSlug  Series: $SeriesSlug  #$SeriesNo  Episode $Episode — $Title"
Write-Host ""

# ======================= Pillar / Group / Series ========================
Ensure-Dir $PILLAR_DIR
$pillarDataPath = Join-Path $PILLAR_DIR ".11tydata.js"
if (-not (Test-Path $pillarDataPath)) {
  $pillarData = @"
export default {
  layout: "base.njk",
  pillar: "$PillarSlug",
  pillarLabel: "The Teachings",
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Teachings", url: "/pillars/$PillarSlug/" }
  ]
};
"@
  Write-FileSafely -Path $pillarDataPath -Content $pillarData -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force | Out-Null
  Done "Pillar data created"
} else { Info "Pillar data exists" }

# Pillar grid: add The Afterlife Series
Update-PillarGridGroup -DataFile $pillarDataPath `
  -Title "The Afterlife Series" `
  -Href "/pillars/$PillarSlug/$SeriesSlug/" `
  -Glyph "☥" `
  -Desc "Maps of death, rebirth, and remembrance across traditions." `
  -Tier "free" `
  -State "default"

# Group (the-afterlife) .11tydata.js
Ensure-Dir $SERIES_GROUP
$groupDataPath = Join-Path $SERIES_GROUP ".11tydata.js"
if (-not (Test-Path $groupDataPath)) {
  $groupData = @"
export default {
  layout: "base.njk",
  pillar: "$PillarSlug",
  series: "$SeriesSlug",
  seriesLabel: "The Afterlife Series",
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Teachings", url: "/pillars/$PillarSlug/" },
    { title: "The Afterlife", url: "/pillars/$PillarSlug/$SeriesSlug/" }
  ]
};
"@
  Write-FileSafely -Path $groupDataPath -Content $groupData -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force | Out-Null
  Done "Group data created"
} else { Info "Group data exists" }

# Group grid: add Series X card
Update-SeriesGrid -DataFile $groupDataPath `
  -Title "Series $SeriesNo" `
  -Href "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/" `
  -Glyph "✝" `
  -Tagline "Series $SeriesNo of The Afterlife" `
  -Tier "free" `
  -State "default"

# Series folder + .11tydata.js
Ensure-Dir $SERIES_DIR
$seriesDataPath = Join-Path $SERIES_DIR ".11tydata.js"
if (-not (Test-Path $seriesDataPath)) {
  $seriesData = @"
export default {
  layout: "base.njk",
  pillar: "$PillarSlug",
  series: "$SeriesSlug",
  seriesMeta: { number: $SeriesNo, label: "Series $SeriesNo", series_version: $SeriesVersion },
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Teachings", url: "/pillars/$PillarSlug/" },
    { title: "The Afterlife", url: "/pillars/$PillarSlug/$SeriesSlug/" },
    { title: "Series $SeriesNo", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/" }
  ]
};
"@
  Write-FileSafely -Path $seriesDataPath -Content $seriesData -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force | Out-Null
  Done "Series data created"
} else { Info "Series data exists" }

# Series-level index.11tydata.js (landing)
$seriesIndexDataPath = Join-Path $SERIES_DIR "index.11tydata.js"
if (-not (Test-Path $seriesIndexDataPath)) {
  $seriesIndexData = @"
export default {
  landing: {
    title: "The Afterlife — Series $SeriesNo",
    description: "$(Yaml-Escape $LandingDescription)"
  },
  introText: "Choose an episode:",
  pillarGrid: [],
  seriesNav: [],
  layout: "base.njk",
  pillar: "$PillarSlug",
  series: "$SeriesSlug",
  seriesMeta: { number: $SeriesNo, label: "Series $SeriesNo", series_version: $SeriesVersion },
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Teachings", url: "/pillars/$PillarSlug/" },
    { title: "The Afterlife", url: "/pillars/$PillarSlug/$SeriesSlug/" },
    { title: "Series $SeriesNo", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/" }
  ]
};
"@
  Write-FileSafely -Path $seriesIndexDataPath -Content $seriesIndexData -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force | Out-Null
  Done "Series index data created"
} else { Info "Series index data exists" }

# Episode card into series-level grid
Update-EpisodeGrid -DataFile $seriesIndexDataPath `
  -Title "$Title" `
  -Href "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/" `
  -Glyph "$Glyph" `
  -Tagline "Three-part journey through the false cosmos and the Revealer." `
  -Tier "$Tier" `
  -State "default"

# ============================ Episode Level =============================
Ensure-Dir $EPISODE_DIR

# Episode index.11tydata.js (Unified v2.6 Schema)
$episodeDataPath = Join-Path $EPISODE_DIR "index.11tydata.js"
if (-not (Test-Path $episodeDataPath)) {
  $episodeData = @"
export default {
  // 📖 Series + Pillar Metadata
  seriesLabel: "The Afterlife Series",
  pillarLabel: "The Teachings",
  glyphRow: ["$Glyph", "☥", "$Glyph"],
  seriesHome: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/",
  pillarHome: "/pillars/$PillarSlug/",
  tagline: "Three-part journey through the false cosmos and the Revealer.",
  layout: "base.njk",

  // 🔹 Series Hierarchy
  pillar: "$PillarSlug",
  series: "$SeriesSlug",
  episode: $Episode,
  seriesMeta: {
    number: $SeriesNo,
    label: "Series $SeriesNo",
    series_version: $SeriesVersion
  },

  // 🜂 Episode Overview
  introText: "— a three-part journey through the false cosmos, the Revealer, and the soul’s return.",
  disclaimerTitle: "⚠️ Diversity of Sources",
  disclaimerText:
    "<p>Interpretations vary across mystical schools and manuscripts within this pillar and series.</p>",

  // 🔹 Episode Parts (for dynamic part navigation)
  episodeParts: [
    { title: "Part I", desc: "The false world and the seeker’s first awakening.", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-1/" },
    { title: "Part II", desc: "The unveiling of divine remembrance through devotion.", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-2/" },
    { title: "Part III", desc: "The soul’s reunion with the Beloved — union beyond self.", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-3/" }
  ],

  // 🔹 Series Navigation (cross-episode buttons)
  seriesNav: [
    { title: "Gnostic Christianity", desc: "The false cosmos, Christ the Revealer, and the soul’s return.", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/gnostic-christianity/" },
    { title: "Sufi Islam", desc: "The seeker’s path through love, annihilation, and return.", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/sufi-islam/" }
  ],

  // 🧭 Scroll Grid Cards (episode landing page)
  pillarGrid: [
    {
      href: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-1/",
      title: "Part I — TBD",
      glyph: "$Glyph",
      tagline: "TBD",
      tier: "$Tier",
      state: "coming-soon"
    },
    {
      href: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-2/",
      title: "Part II — TBD",
      glyph: "$Glyph",
      tagline: "TBD",
      tier: "$Tier",
      state: "coming-soon"
    },
    {
      href: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-3/",
      title: "Part III — TBD",
      glyph: "$Glyph",
      tagline: "TBD",
      tier: "$Tier",
      state: "coming-soon"
    }
  ],

  // 🧭 Computed properties for flexible page rendering
  eleventyComputed: {
    slug: (data) => data.slug || data.page.fileSlug,
    permalink: (data) => data.permalink || data.page.url,
    imgBase: (data) => data.imgBase || "/media/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug",
    imgPrefix: (data) => data.imgPrefix || "$Slug-",
    socialImage: (data) => data.socialImage || "/tgk-assets/images/share/$PillarSlug/$SeriesSlug/$Slug.jpg",
    breadcrumbsBase: () => [
      { title: "The Gnostic Key", url: "/" },
      { title: "The Teachings", url: "/pillars/the-teachings/" },
      { title: "The Afterlife", url: "/pillars/the-teachings/the-afterlife/" },
      { title: "Series $SeriesNo", url: "/pillars/the-teachings/the-afterlife/series-$SeriesNo/" }
    ],
    breadcrumbs: (data) =>
      [...(data.breadcrumbsBase || []), data.title ? { title: data.title } : null].filter(Boolean)
  }
};
"@
  Write-FileSafely -Path $episodeDataPath -Content $episodeData -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force | Out-Null
  Done "Episode index.11tydata.js created"
} else { Info "Episode index.11tydata.js exists" }

# Episode index.njk (simple intro + grid include)
$episodeIndexNjkPath = Join-Path $EPISODE_DIR "index.njk"
if (-not (Test-Path $episodeIndexNjkPath)) {
  $episodeIndexNjk = @"
---
layout: base.njk
title: "$(Yaml-Escape $Title)"
description: "Three-part journey."
tier: $(Yaml-Escape $Tier)
glyph: "$(Yaml-Escape $Glyph)"
series_version: $SeriesVersion
permalink: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/index.html"
tagline: "Three-part journey through the false cosmos and the Revealer."
seriesMeta:
  number: $SeriesNo
  label: "Series $SeriesNo"
  series_version: $SeriesVersion
episode: $Episode

breadcrumbs:
  - { title: "The Gnostic Key", url: "/" }
  - { title: "The Teachings", url: "/pillars/$PillarSlug/" }
  - { title: "The Afterlife", url: "/pillars/$PillarSlug/$SeriesSlug/" }
  - { title: "Series $SeriesNo", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/" }
---

{% block head %}
  {% set socialImage = "/tgk-assets/images/share/$PillarSlug/$SeriesSlug/$Slug.jpg" %}
  {% include "partials/head-meta.njk" %}
  {% set items = pillarGrid %}
  {% set headline = "$(Yaml-Escape $Title) — Series $SeriesNo" %}
  {% set base = "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/" %}
  {% include "partials/jsonld-collection.njk" %}
{% endblock %}

<main class="main-content">
  <section class="content-container">
    <h4 class="index-heading">
      tagline: "$(Yaml-Escape 'Three-part journey through the false cosmos and the Revealer.')",
    </h4>

    {% include "partials/pillar-grid.njk" %}

    <div class="gnostic-divider">
      <span class="divider-symbol pillar-glyph spin glow" aria-hidden="true">{{ glyph or pillarGlyph }}</span>
    </div>
  </section>
</main>
"@
  Write-FileSafely -Path $episodeIndexNjkPath -Content $episodeIndexNjk -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force | Out-Null
  Done "Episode index.njk created"
} else { Info "Episode index.njk exists" }

# ============================== Parts ===================================
$parts = 1..3
foreach ($n in $parts) {
  $partSlug = Part-Slug $n
  $partDir  = Join-Path $EPISODE_DIR $partSlug
  Ensure-Dir $partDir

  $permalink = "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/$partSlug/index.html"
  $imgBase   = "/media/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/$partSlug"
  $imgPrefix = "$Slug-"

  $frontMatter = @"
---
layout: base.njk
title: "$(Yaml-Escape $Title)"
description: ""
tier: $(Yaml-Escape $Tier)
scrollId: "$PillarSlug-$SeriesSlug-series-$SeriesNo-$Slug-$partSlug"

episode: $Episode
partNumeral: $(To-Roman $n)
partTitle: ""
tagline: ""
slug: "$partSlug"

permalink: "$permalink"
socialImage: "/tgk-assets/images/share/$PillarSlug/$SeriesSlug/$Slug-$partSlug.jpg"
imgBase: "$imgBase"
imgPrefix: "$imgPrefix"
bodyClass: "$(Yaml-Escape $BodyClass)"

glyph: "$(Yaml-Escape $Glyph)"
pillar: "$PillarSlug"
series: "$SeriesSlug"

seriesId: "$seriesId"
episodeId: "$episodeId"
partId: "$(Part-Id $n)"
quizId: "$($seriesId)-$($episodeId)-$($partSlug)"
quizIntro: "Can you see through the veil of $(To-Roman $n)?"
seriesMeta:
  number: $SeriesNo
  label: "Series $SeriesNo"
  series_version: $SeriesVersion

# Visibility
sitemap: true
discussEnabled: true
resourcesEnabled: true
seriesNavEnabled: true
quizEnabled: true
lensEnabled: true
creativePromptEnabled: false
discussionPromptEnabled: true

# ⚯ Synergist Lens data
crossLinks: []
vaultRefs: []
communityThreads: []
relatedProducts: []

# 🎨 Creative Prompt (optional; section hidden if both fields are empty)
creativePrompt:
  text: ""
  sharePrompt: ""

# 🗣 Discussion Prompt (optional scaffolding)
discussion:
  promptTitle: "What spark are you reigniting?"
  intro: "You’ve walked through illusion and shadow — now speak from your own flame."
  question: "What does liberation mean to a soul that remembers?"
  points:
    - "What illusions still whisper your name?"
    - "How does memory become freedom?"
    - "Can truth survive comfort?"
  footer: "Share your reflections using <strong>#TheGnosticKey</strong> and tag <strong>@thegnostickey</strong>."

# 📖 Glossary
glossary:
  subtitle: "Decode the language of the soul’s exile and return."
  terms:
    - term: "TBC"
      def: "TBC"

# 📚 References
references:
  title: "Sources & Study Path"
  intro: "For those wishing to go deeper..."
  readings:
    - title: "TBC"
      desc: "TBC"
  scholarly:
    - author: "TBC"
      year: "TBC"
      work: "TBC"
      pub: "TBC"

breadcrumbs:
  - { title: "The Gnostic Key", url: "/" }
  - { title: "The Teachings", url: "/pillars/the-teachings/" }
  - { title: "The Afterlife", url: "/pillars/the-teachings/the-afterlife/" }
  - { title: "Series $SeriesNo", url: "/pillars/the-teachings/the-afterlife/series-$SeriesNo/" }
  - { title: "$(Yaml-Escape $Title)", url: "/pillars/the-teachings/the-afterlife/series-$SeriesNo/$Slug/" }
  - { title: "$(To-Roman $n)" }

---

{% include "partials/scroll-tabs.njk" %}

<main class="main-content">
  <section class="content-container">

  <section class="section-block">
    <h2 class="section-heading">Section Heading</h2>
    <p>Write content for $(To-Roman $n) here...</p>
  </section>

  {% include "partials/creative-prompt.njk" %}
  {% include "partials/discussion-prompt.njk" %}
  {% include "partials/quiz-block.njk" %}
  {% include "partials/glossary-block.njk" %}
  {% include "partials/reference-section.njk" %}

  {% include "partials/series-nav-buttons.njk" %}
  {% include "partials/episode-part-nav.njk" %}

  <div class="gnostic-divider">
    <span class="divider-symbol pillar-glyph spin" aria-hidden="true">⛪︎</span>
  </div>

  </section>
</main>
"@

  $mdPath = Join-Path $partDir "index.md"
  Write-FileSafely -Path $mdPath -Content $frontMatter -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force | Out-Null
  Done ("Part {0}: {1}" -f (To-Roman $n), $mdPath)

  if ($WithImages.IsPresent) {
    $mediaDir = Join-Path $MEDIA_ROOT $partSlug
    Ensure-Dir $mediaDir
    1..2 | ForEach-Object {
      $jpg  = Join-Path $mediaDir "$($Slug)-placeholder-$($_).jpg"
      $webp = Join-Path $mediaDir "$($Slug)-placeholder-$($_).webp"
      [System.IO.File]::WriteAllBytes($jpg,  [byte[]]@())  # empty files
      [System.IO.File]::WriteAllBytes($webp, [byte[]]@())
    }
    Info "Media placeholders: $mediaDir"
  }

  if ($WithQuizzes.IsPresent) {
    Ensure-Dir $QUIZ_SERIES
    $quizId   = "$($seriesId)-$($episodeId)-$($partSlug)"
    $quizFile = Join-Path $QUIZ_SERIES "$quizId.js"

    $quizStub = @"
export default {
  meta: {
    seriesId: "$seriesId",
    episodeId: "$episodeId",
    partId: "$(Part-Id $n)",
    quizId: "$quizId",
    title: "$(Yaml-Escape $Title) — $(To-Roman $n)"
  },
  intro: "How well do you see through the illusion? Test your memory of the hidden cosmology.",
  questions: [
    {
      id: "q1",
      prompt: "Placeholder question for $(Yaml-Escape $Title) — $(To-Roman $n).",
      options: [
        { key: "A", label: "Option A" },
        { key: "B", label: "Option B" },
        { key: "C", label: "Option C" },
        { key: "D", label: "Option D" }
      ],
      answer: "A",
      explanation: "Replace with real explanation."
    }
  ]
};
"@
    Write-FileSafely -Path $quizFile -Content $quizStub -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force | Out-Null
    Info "Quiz stub: $quizFile"

    # Append import + registry to global quiz index
    Ensure-Dir (Split-Path -Parent $QUIZ_INDEX)
    if (!(Test-Path $QUIZ_INDEX)) {
      $init = @"
// Auto-generated by TGK Afterlife Generator 2.5
export default {};
"@
      Write-Utf8File -Path $QUIZ_INDEX -Content $init
    }

    $relPath     = "./$PillarSlug/$SeriesSlug/series-$SeriesNo/$quizId.js"
    $importName  = ($quizId -replace '[^\w]','_')   # safe identifier
    $indexSource = Get-Content $QUIZ_INDEX -Raw

    if ($indexSource -notmatch [regex]::Escape($relPath)) {
      $importLine = "import $importName from '$relPath';"
      if ($indexSource -notmatch '^\s*import\s' -and $indexSource -notmatch 'export\s+default') {
        $indexSource = "$importLine`n`nexport default {`n  [$importName.meta.quizId]: $importName,`n};`n"
      } else {
        if ($indexSource -notmatch '^\s*import') {
          $indexSource = "$importLine`n`n$indexSource"
        } else {
          $indexSource = $indexSource -replace '^(import[^\n]*\n)*', ("$&$importLine`n")
        }
        if ($indexSource -notmatch 'export\s+default\s*\{') {
          $indexSource = $indexSource.TrimEnd() + "`n`nexport default {`n};`n"
        }
        $indexSource = $indexSource -replace 'export\s+default\s*\{', "export default {`n  [$importName.meta.quizId]: $importName,"
      }
      Write-Utf8File -Path $QUIZ_INDEX -Content $indexSource
      Done "Appended quiz to index: $QUIZ_INDEX"
    } else {
      Info "Quiz already present in index: $quizId"
    }
  }
}

# ========================= Synergy Build / Finish =======================
if (-not $Quick.IsPresent) {
  Info "⚯ Building Synergy Map (global)…"
  Build-SynergyMap -Root $Root
} else {
  Info "⏭  Skipping synergy map rebuild (-Quick)"
}

Done "All tasks complete."