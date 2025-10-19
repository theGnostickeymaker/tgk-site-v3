
<# ======================================================================
  TGK — create-new-afterlife-series_v2.ps1
  Purpose: Generate Afterlife Series scaffolding + Synergist Lens + Quiz + Media
  Author: TGK Assistant
  Version: 2.0 (2025-10-08)
  ----------------------------------------------------------------------
  USAGE EXAMPLE
  -------------
  pwsh scripts/ps/create-new-afterlife-series_v2.ps1 `
    -Root "C:\TGK\tgk-site-v3" `
    -PillarSlug "the-teachings" `
    -SeriesSlug "the-afterlife" `
    -SeriesNo 1 `
    -SeriesGroup "The Afterlife Series" `
    -Slug "sufi-islam" `
    -Title "Sufi Islam" `
    -Episode 2 `
    -Tier "free" `
    -Glyph "☪" `
    -BodyClass "gold" `
    -WithQuizzes `
    -WithImages

  Flags:
    -Quick       -> skip synergy map rebuild
    -LensOnly    -> only rebuild synergy map (no file creation)
    -WithQuizzes -> create quiz stubs + append to /src/_data/quiz/index.js
    -WithImages  -> create media folders + 2 placeholder images per part
 ====================================================================== #>

[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)] [string] $Root,
  [Parameter(Mandatory=$true)] [string] $PillarSlug,         # e.g., the-teachings
  [Parameter(Mandatory=$true)] [string] $SeriesSlug,         # e.g., the-afterlife
  [Parameter(Mandatory=$true)] [int]    $SeriesNo,           # e.g., 1
  [Parameter(Mandatory=$true)] [string] $Slug,               # episode slug, e.g., gnostic-christianity
  [Parameter(Mandatory=$true)] [string] $Title,              # episode title
  [Parameter(Mandatory=$true)] [int]    $Episode,            # episode number, e.g., 1..6
  [Parameter(Mandatory=$true)] [string] $Tier,               # free | paid | etc.
  [Parameter(Mandatory=$true)] [string] $Glyph,
  [Parameter(Mandatory=$true)] [string] $BodyClass,
  [string] $SeriesGroup = "The Afterlife Series",
  [switch] $Quick,
  [switch] $LensOnly,
  [switch] $WithQuizzes,
  [switch] $WithImages
)

# ----------------------------- Helpers ---------------------------------
function Ensure-Dir($path) {
  if (!(Test-Path -LiteralPath $path)) {
    New-Item -ItemType Directory -Path $path | Out-Null
  }
}

function Write-Utf8File {
  param([string]$Path, [string]$Content)
  $dir = Split-Path -Parent $Path
  if ($dir) { Ensure-Dir $dir }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

# YAML safe string
function Yaml-Escape([string]$s) {
  if ($null -eq $s) { return "" }
  if ($s -match "[:#\-\?\[\]\{\},&\*!\|>'" + '"' + "%@`"]") { return '"' + ($s -replace '"','\"') + '"' }
  return $s
}

# Roman numerals (1..3)
function To-Roman([int]$n) {
  switch ($n) {
    1 {'I'}
    2 {'II'}
    3 {'III'}
    default {throw "Only 1..3 supported for part number."}
  }
}

# Slug helpers for parts
function Part-Slug([int]$n) { "part-$n" }
function Part-Id([int]$n) { "part$n" }

# Synergy Map structure
class SynergyNode {
  [string]$id
  [string]$title
  [string]$url
  [string]$pillar
  [string]$series
  [string]$episode
  [string]$part
  [string]$tier
  [string]$type # "scroll"
}

class SynergyEdge {
  [string]$source
  [string]$target
  [string]$relation # "crossLink" | "vaultRef" | "community" | "product"
}

# -----------------------------------------------------------------------
# PATHS
$SRC_ROOT      = Join-Path $Root "src"
$PILLAR_DIR    = Join-Path $SRC_ROOT "pillars\$PillarSlug"
$SERIES_GROUP  = Join-Path $PILLAR_DIR "$SeriesSlug"
$SERIES_DIR    = Join-Path $SERIES_GROUP "series-$SeriesNo"
$EPISODE_DIR   = Join-Path $SERIES_DIR "$Slug"
$QUIZ_ROOT     = Join-Path $SRC_ROOT "_data\quiz"
$QUIZ_SERIES   = Join-Path $QUIZ_ROOT "$PillarSlug\$SeriesSlug\series-$SeriesNo"
$QUIZ_INDEX    = Join-Path $QUIZ_ROOT "index.js"
$MEDIA_ROOT    = Join-Path $SRC_ROOT "media\$PillarSlug\$SeriesSlug\series-$SeriesNo\$Slug"

# IDs
$seriesId = "$SeriesSlug-s$SeriesNo"
$episodeId = $Slug

# Build only the synergy map if requested
if ($LensOnly.IsPresent) {
  Write-Host "⚯ Rebuilding synergy map only..."
  Build-SynergyMap -Root $Root
  exit 0
}

# -----------------------------------------------------------------------
# Create episode + part folders
Ensure-Dir $EPISODE_DIR

# Create three parts by default (1..3)
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
  series_version: 1

# 🔮 Section Visibility Controls
discussEnabled: true
referencesEnabled: true
seriesNavEnabled: true
quizEnabled: true
lensEnabled: true

# ⚯ Synergist Lens data
crossLinks: []
vaultRefs: []
communityThreads: []
relatedProducts: []

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

  {% include "partials/discussion-prompt.njk" %}
  {% include "partials/quiz-block.njk" %}
  {% include "partials/glossary-block.njk" %}
  {% include "partials/reference-section.njk" %}

  <!-- ∞ Synergist Lens (Cross-links, Vault, Community, Artifacts) -->
  {% raw %}{% if (crossLinks and crossLinks.length) 
      or (vaultRefs and vaultRefs.length) 
      or (communityThreads and communityThreads.length) 
      or (relatedProducts and relatedProducts.length) %}
    {% include "partials/synergist-lens.njk" %}
  {% endif %}{% endraw %}

  {% include "partials/episode-part-nav.njk" %}

  <div class="gnostic-divider">
    <span class="divider-symbol pillar-glyph spin" aria-hidden="true">⛪︎</span>
  </div>

  </section>
</main>
"@

  $mdPath = Join-Path $partDir "index.md"
  Write-Utf8File -Path $mdPath -Content $frontMatter
  Write-Host "🧾 Created: $mdPath"

  if ($WithImages.IsPresent) {
    $mediaDir = Join-Path $MEDIA_ROOT $partSlug
    Ensure-Dir $mediaDir
    1..2 | ForEach-Object {
      $jpg = Join-Path $mediaDir "$($Slug)-placeholder-$($_).jpg"
      $webp = Join-Path $mediaDir "$($Slug)-placeholder-$($_).webp"
      # create small placeholder files
      Set-Content -Path $jpg -Value "" -Encoding Byte
      Set-Content -Path $webp -Value "" -Encoding Byte
    }
    Write-Host "🖼  Media placeholders: $mediaDir"
  }

  if ($WithQuizzes.IsPresent) {
    Ensure-Dir $QUIZ_SERIES
    $quizId = "$($seriesId)-$($episodeId)-$($partSlug)"
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
    Write-Utf8File -Path $quizFile -Content $quizStub
    Write-Host "🧪 Quiz stub: $quizFile"

    # Append to global quiz index (ESM imports + registry map)
    Ensure-Dir (Split-Path -Parent $QUIZ_INDEX)
    if (!(Test-Path $QUIZ_INDEX)) {
      $init = @"
// Auto-generated by create-new-afterlife-series_v2.ps1
export default {};
"@
      Write-Utf8File -Path $QUIZ_INDEX -Content $init
    }

    $relPath = "./$PillarSlug/$SeriesSlug/series-$SeriesNo/$quizId.js"
    $importName = ($quizId -replace '[-]','_')
    $indexContent = Get-Content $QUIZ_INDEX -Raw

    if ($indexContent -notmatch [regex]::Escape($relPath)) {
      $importLine = "import $importName from '$relPath';"
      # Ensure imports at top
      if ($indexContent -notmatch 'import ') {
        $indexContent = "$importLine`n`n$indexContent"
      } else {
        $indexContent = $indexContent -replace '^(import[^\n]*\n)*', ("$&$importLine`n")
      }

      # Ensure default export object exists
      if ($indexContent -notmatch 'export\s+default\s*\{') {
        $indexContent = $indexContent.TrimEnd() + "`n`nexport default {`n};`n"
      }

      # Insert mapping line before closing brace
      $mapping = "  [$importName.meta.quizId]: $importName,"
      $indexContent = $indexContent -replace 'export\s+default\s*\{', "export default {\n$mapping"
      Write-Utf8File -Path $QUIZ_INDEX -Content $indexContent
      Write-Host "🧷 Appended quiz to index: $QUIZ_INDEX"
    } else {
      Write-Host "ℹ️ Quiz already present in index: $quizId"
    }
  }
}

# -----------------------------------------------------------------------
if (-not $Quick.IsPresent) {
  Write-Host "⚯ Building Synergy Map..."
  Build-SynergyMap -Root $Root
} else {
  Write-Host "⏭  Skipping synergy map rebuild (-Quick)"
}

Write-Host "✅ Done."

# ========================== Synergy Builder =============================
function Build-SynergyMap {
  param([Parameter(Mandatory=$true)][string]$Root)

  $src = Join-Path $Root "src"
  $outDir = Join-Path $src "_data"
  Ensure-Dir $outDir
  $outFile = Join-Path $outDir "synergyMap.json"

  $nodes = New-Object System.Collections.Generic.List[SynergyNode]
  $edges = New-Object System.Collections.Generic.List[SynergyEdge]

  # Scan all index.md under pillars for front matter
  $mdFiles = Get-ChildItem -Path (Join-Path $src "pillars") -Recurse -Filter "index.md" -ErrorAction SilentlyContinue

  foreach ($f in $mdFiles) {
    $raw = Get-Content $f.FullName -Raw
    if ($raw -notmatch '^---\s*(.*?)\s*---'s) { continue }
    $yaml = [regex]::Match($raw, '^---\s*(.*?)\s*---' , 'Singleline').Groups[1].Value

    # crude YAML parse for the fields we care about
    function YGet([string]$key) {
      if ($yaml -match "^(?ms)$key\s*:\s*(.+?)$") { return ($Matches[1].Trim()) }
      return $null
    }

    $title = (YGet "title") -replace '^"|"$',''
    $permalink = (YGet "permalink") -replace '^"|"$',''
    $pillar = (YGet "pillar") -replace '^"|"$',''
    $series = (YGet "series") -replace '^"|"$',''
    $tier = (YGet "tier") -replace '^"|"$',''
    $scrollId = (YGet "scrollId") -replace '^"|"$',''

    # episodeId, partId (optional)
    $episodeId = (YGet "episodeId") -replace '^"|"$',''
    $partId = (YGet "partId") -replace '^"|"$',''

    if (-not $scrollId) { $scrollId = $permalink }

    $node = [SynergyNode]::new()
    $node.id = $scrollId
    $node.title = $title
    $node.url = $permalink
    $node.pillar = $pillar
    $node.series = $series
    $node.episode = $episodeId
    $node.part = $partId
    $node.tier = $tier
    $node.type = "scroll"
    $nodes.Add($node) | Out-Null

    # Extract arrays (very lightweight parsing)
    function Extract-Array([string]$name) {
      if ($yaml -match "(?ms)^$name\s*:\s*\[(.*?)\]") {
        $inner = $Matches[1]
        $items = @()
        foreach ($m in ([regex]::Matches($inner, '"([^"]+)"'))) {
          $items += $m.Groups[1].Value
        }
        return ,$items
      } elseif ($yaml -match "(?ms)^$name\s*:\s*\-\s*(.+)") {
        # handle YAML list of objects/strings; collect 'path:' lines as targets when present
        $list = @()
        $block = $yaml.Substring($yaml.IndexOf("$name:"))
        foreach ($line in $block.Split("`n")) {
          if ($line -match "^\s*-\s*title:") { $list += $null; continue }
          if ($line -match "^\s*path:\s*\"([^\"]+)\"") { $list[-1] = $Matches[1] }
          elseif ($line -match "^\s*-\s*\"([^\"]+)\"") { $list += $Matches[1] }
          elseif ($line -match "^\s*-\s*(/[\w\-/]+)") { $list += $Matches[1] }
          elseif ($line -match "^\S") { break }
        }
        return ,($list | Where-Object { $_ })
      }
      return @()
    }

    $cross = Extract-Array "crossLinks"
    $vault = Extract-Array "vaultRefs"
    $community = Extract-Array "communityThreads"
    $products = Extract-Array "relatedProducts"

    foreach ($t in $cross)     { $edges.Add([SynergyEdge]@{source=$node.id; target=$t; relation="crossLink"}) | Out-Null }
    foreach ($t in $vault)     { $edges.Add([SynergyEdge]@{source=$node.id; target=$t; relation="vaultRef"}) | Out-Null }
    foreach ($t in $community) { $edges.Add([SynergyEdge]@{source=$node.id; target=$t; relation="community"}) | Out-Null }
    foreach ($t in $products)  { $edges.Add([SynergyEdge]@{source=$node.id; target=$t; relation="product"}) | Out-Null }
  }

  $payload = [ordered]@{
    generatedAt = (Get-Date).ToString("s")
    nodes = $nodes
    edges = $edges
  } | ConvertTo-Json -Depth 6

  Write-Utf8File -Path $outFile -Content $payload
  Write-Host "🗺  Synergy map written: $outFile"
}
