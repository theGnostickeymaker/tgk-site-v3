<# ======================================================================
  TGK — create-new-afterlife-series_v2.3.ps1
  Purpose: Generate Afterlife Series scaffolding + Synergist Lens + Quiz + Media
  Version: 2.3 — Adds full grid auto-merge + update logic (2025-10-08)
 ====================================================================== #>

#Requires -Version 5.1
[CmdletBinding()]
param(
    # ===== Required identifiers =====
    [Parameter(Mandatory)] [string] $PillarSlug,          # e.g., the-teachings
    [Parameter(Mandatory)] [string] $SeriesSlug,          # e.g., the-afterlife
    [Parameter(Mandatory)] [int]    $SeriesNo,            # e.g., 1
    [Parameter(Mandatory)] [string] $Slug,                # episode slug, e.g., sufi-islam
    [Parameter(Mandatory)] [string] $Title,               # episode title
    [Parameter(Mandatory)] [int]    $Episode,             # episode number

    # ===== Display / content =====
    [ValidateSet('free', 'initiate', 'full', 'paid')]
    [Parameter(HelpMessage = "Specify content tier: free, initiate, full, or paid.")]
    [string] $Tier = 'free',

    [string] $Glyph = '⛪︎',
    [string] $BodyClass = 'gold',
    [string] $SeriesGroup = "The Afterlife Series",
    [int]    $SeriesVersion = 1,
    [string] $LandingDescription = "Three-part journey.",
    [string] $Root = '.',

    # ===== Feature flags =====
    [switch] $WithQuizzes,
    [switch] $WithImages,
    [switch] $Quick,         # skip synergy rebuild
    [switch] $LensOnly,      # only rebuild synergy map
    [switch] $ConfirmOverwrite,
    [switch] $Force
)

Write-Host "✅ Parameter block parsed successfully."

# ----------------------------- Helpers ---------------------------------
function Ensure-Dir([string]$path) {
    if (!(Test-Path -LiteralPath $path)) {
        New-Item -ItemType Directory -Path $path | Out-Null
    }
}

function Safe-WriteFile {
    param(
        [Parameter(Mandatory)] [string] $Path,
        [Parameter(Mandatory)] [string] $Content,
        [switch] $Force,
        [switch] $ConfirmOverwrite
    )

    $dir = Split-Path -Parent $Path
    if ($dir) { Ensure-Dir $dir }

    if ((Test-Path $Path) -and -not $Force) {
        if ($ConfirmOverwrite) {
            Write-Host "⚠️  File already exists: $Path" -ForegroundColor Yellow
            $response = Read-Host "Overwrite existing file? (Y/N)"
            if ($response -notmatch '^[Yy]$') {
                Write-Host "⏭️  Skipped writing: $Path" -ForegroundColor DarkGray
                return
            }
        }
        else {
            Write-Host "⏭️  Skipping existing file (use -ConfirmOverwrite or -Force): $Path" -ForegroundColor DarkGray
            return
        }
    }

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
    Write-Host "💾 Wrote: $Path" -ForegroundColor Green
}

function Merge-JSGrid {
    param(
        [string]$IndexPath,
        [string]$ArrayName,
        [string]$Key,
        [string]$NewBlock
    )
    if (!(Test-Path $IndexPath)) { Write-Host "⚠️  $IndexPath not found"; return }

    $c = Get-Content $IndexPath -Raw
    if ($c -notmatch "$ArrayName\s*:") { 
        $insert = "${ArrayName}: [`n$NewBlock`n],"
        $c = $c -replace '(export\s+default\s*\{)', "`$1`n  $insert"
        Write-Host "🆕 Created $ArrayName in: $IndexPath"
    }
    elseif ($c -notmatch [regex]::Escape($Key)) {
        $c = $c -replace "($ArrayName\s*:\s*\[)", "`$1`n$NewBlock,"
        Write-Host "📇 Appended new $ArrayName entry to: $IndexPath"
    }
    else {
        $pattern = '(?ms)\{\s*href:\s*"' + [regex]::Escape($Key) + '".*?\}'
        if ($c -match $pattern -and ($Matches[0] -ne $NewBlock.Trim())) {
            $c = $c -replace $pattern, $NewBlock.Trim()
            Write-Host "🔁 Updated existing $ArrayName card for: $Key"
        }
        else {
            Write-Host "✔ $ArrayName already up-to-date for: $Key"
        }
    }
    Safe-WriteFile -Path $IndexPath -Content $c -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force
}

function Update-PillarIndex {
    param([string]$Path, [string]$Href, [string]$Title, [string]$Glyph, [string]$Tagline, [string]$Tier, [string]$State)
    $block = @"
    {
        href: "$Href",
        title: "$Title",
        glyph: "$Glyph",
        tagline: "$Tagline",
        tier: "$Tier",
        state: "$State"
    }
"@
    Merge-JSGrid -IndexPath $Path -ArrayName "pillarGrid" -Key $Href -NewBlock $block
}

function Update-SeriesNav {
    param([string]$Path, [string]$Title, [string]$Desc, [string]$Url)
    $block = @"
    { title: "$Title", desc: "$Desc", url: "$Url" }
"@
    Merge-JSGrid -IndexPath $Path -ArrayName "seriesNav" -Key $Url -NewBlock $block
}

function Update-EpisodeGrid {
    param([string]$DataFile, [string]$Title, [string]$Href, [string]$Glyph, [string]$Tagline, [string]$Tier, [string]$State)
    $block = @"
    {
        href: "$Href",
        title: "$Title",
        glyph: "$Glyph",
        tagline: "$Tagline",
        tier: "$Tier",
        state: "$State"
    }
"@
    Merge-JSGrid -IndexPath $DataFile -ArrayName "episodeGrid" -Key $Href -NewBlock $block
}

function Yaml-Escape([string]$s) {
    if ([string]::IsNullOrWhiteSpace($s)) { return "" }
    if ($s -match "[:#\-\?\[\]\{\},&\*!\|>'" + '"' + "%@`"]") { return '"' + ($s -replace '"', '\"') + '"' }
    return $s
}

function To-Roman([int]$n) { switch ($n) { 1 { 'I' } 2 { 'II' } 3 { 'III' } default { '?' } } }
function Part-Slug([int]$n) { "part-$n" }
function Part-Id([int]$n) { "part$n" }

# Path setup
$SRC = Join-Path $Root "src"
$PILLAR = Join-Path $SRC "pillars\$PillarSlug"
$GROUP = Join-Path $PILLAR "$SeriesSlug"
$SERIES = Join-Path $GROUP "series-$SeriesNo"
$EPISODE = Join-Path $SERIES "$Slug"
$MEDIA = Join-Path $SRC "media\$PillarSlug\$SeriesSlug\series-$SeriesNo\$Slug"
$seriesId = "$SeriesSlug-s$SeriesNo"
$episodeId = $Slug

# Pillar & Series grid updates
$pillarData = Join-Path $PILLAR ".11tydata.js"
$groupData = Join-Path $GROUP ".11tydata.js"
$seriesData = Join-Path $SERIES ".11tydata.js"

if (Test-Path $pillarData) {
    Update-PillarIndex -Path $pillarData `
        -Href "/pillars/$PillarSlug/$SeriesSlug/" `
        -Title "The Afterlife Series" `
        -Glyph "☥" `
        -Tagline "Maps of death, rebirth, and remembrance across traditions." `
        -Tier "free" -State "coming-soon"
}

if (Test-Path $groupData) {
    Update-PillarIndex -Path $groupData `
        -Href "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/" `
        -Title "Series $SeriesNo" `
        -Glyph "✝" `
        -Tagline "Series $SeriesNo of The Afterlife" `
        -Tier "free" -State "coming-soon"
}

if (Test-Path $seriesData) {
    $href = "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/"
    Update-PillarIndex -Path $seriesData -Href $href -Title $Title `
        -Glyph $Glyph -Tagline "Three-part journey through the false cosmos and the Revealer." `
        -Tier $Tier -State "coming-soon"
    Update-SeriesNav -Path $seriesData -Title $Title `
        -Desc "Three-part journey through the false cosmos and the Revealer." `
        -Url $href
}

Write-Host "✅ Grid merge logic ready — run full generator to auto-update cards."

# Paths
$SRC_ROOT = Join-Path $Root "src"
$PILLAR_DIR = Join-Path $SRC_ROOT "pillars\$PillarSlug"
$SERIES_GROUP = Join-Path $PILLAR_DIR "$SeriesSlug"
$SERIES_DIR = Join-Path $SERIES_GROUP "series-$SeriesNo"
$EPISODE_DIR = Join-Path $SERIES_DIR "$Slug"
$QUIZ_ROOT = Join-Path $SRC_ROOT "_data\quiz"
$QUIZ_SERIES = Join-Path $QUIZ_ROOT "$PillarSlug\$SeriesSlug\series-$SeriesNo"
$QUIZ_INDEX = Join-Path $QUIZ_ROOT "index.js"
$MEDIA_ROOT = Join-Path $SRC_ROOT "media\$PillarSlug\$SeriesSlug\series-$SeriesNo\$Slug"

$seriesId = "$SeriesSlug-s$SeriesNo"
$episodeId = $Slug

# Lens Only
if ($LensOnly.IsPresent) {
    Write-Host "⚯ Rebuilding synergy map only (site-wide)..."
    Build-SynergyMap -Root $Root
    exit 0
}

Write-Host "⛭ TGK Afterlife Generator 2.3"
Write-Host "   Pillar: $PillarSlug  Series: $SeriesSlug  #$SeriesNo  Episode $Episode — $Title"
Write-Host ""

# Pillar / Group / Series
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
    Safe-WriteFile -Path $pillarDataPath -Content $pillarData -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force
    Write-Host "🧩 Wrote pillar data: $pillarDataPath"
} else { Write-Host "✔ Pillar data exists" }

Update-PillarIndex -Path $pillarDataPath `
    -Title "The Afterlife Series" `
    -Href "/pillars/$PillarSlug/$SeriesSlug/" `
    -Glyph "☥" `
    -Tagline "Maps of death, rebirth, and remembrance across traditions." `
    -Tier "free" `
    -State "coming-soon"

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
    Safe-WriteFile -Path $groupDataPath -Content $groupData -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force
    Write-Host "🧩 Wrote group data: $groupDataPath"
} else { Write-Host "✔ Group data exists" }

Update-PillarIndex -Path $groupDataPath `
    -Title "Series $SeriesNo" `
    -Href "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/" `
    -Glyph "✝" `
    -Tagline "Series $SeriesNo of The Afterlife" `
    -Tier "free" `
    -State "coming-soon"

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
    Safe-WriteFile -Path $seriesDataPath -Content $seriesData -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force
    Write-Host "🧩 Wrote series data: $seriesDataPath"
} else { Write-Host "✔ Series data exists" }

Update-EpisodeGrid -DataFile $seriesDataPath `
    -Title "$Title" `
    -Href "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/" `
    -Glyph "$Glyph" `
    -Tagline "Three-part journey through the false cosmos and the Revealer." `
    -Tier "$Tier" `
    -State "coming-soon"

$seriesIndexDataPath = Join-Path $SERIES_DIR "index.11tydata.js"
if (-not (Test-Path $seriesIndexDataPath)) {
    $seriesIndexData = @"
export default {
  landing: {
    title: "The Afterlife — Series $SeriesNo",
    description: "$(Yaml-Escape $LandingDescription)"
  },
  episodeParts: [
    { title: "$Title — Part I",  url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-1/" },
    { title: "$Title — Part II", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-2/" },
    { title: "$Title — Part III",url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-3/" }
  ]
};
"@
    Safe-WriteFile -Path $seriesIndexDataPath -Content $seriesIndexData -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force
    Write-Host "🧩 Wrote series index data: $seriesIndexDataPath"
} else { Write-Host "✔ Series index data exists" }

# Episode Level
Ensure-Dir $EPISODE_DIR

$episodeIndexData = @"
export default {
  // 🜂 Series Overview
  introText: "— a three-part journey through the false cosmos, the Revealer, and the soul’s return.",
  tagline: "The false cosmos ✦ Christ the Revealer ✦ the soul’s return.",
  episode: $Episode,
  seriesMeta: { number: $SeriesNo, label: "Series $SeriesNo", series_version: $SeriesVersion },

  // 🧭 Scroll Grid Cards (filled as needed)
  pillarGrid: [],

  // 🔹 Episode Parts (for dynamic part navigation)
  episodeParts: [
    { title: "Part I — TBD", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-1/" },
    { title: "Part II — TBD", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-2/" },
    { title: "Part III — TBD", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-3/" }
  ],

  layout: "base.njk",
  pillar: "$PillarSlug"
};
"@
$episodeIndexDataPath = Join-Path $EPISODE_DIR "index.11tydata.js"
if (-not (Test-Path $episodeIndexDataPath)) {
    Safe-WriteFile -Path $episodeIndexDataPath -Content $episodeIndexData -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force
    Write-Host "🧩 Wrote episode index data: $episodeIndexDataPath"
} else { Write-Host "✔ Episode index data exists" }

# Parts
# Initialize quiz index content
Ensure-Dir (Split-Path -Parent $QUIZ_INDEX)
if (!(Test-Path $QUIZ_INDEX)) {
    $init = @"
// Auto-generated TGK Quiz Index — Clean v2.3
export default {};
"@
    Safe-WriteFile -Path $QUIZ_INDEX -Content $init -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force
}
$indexContent = Get-Content $QUIZ_INDEX -Raw

for ($n = 1; $n -le 3; $n++) {
    $partSlug = Part-Slug $n
    $permalink = "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/$partSlug/"
    $imgBase = "/tgk-assets/images/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug"
    $imgPrefix = "$Slug-$partSlug-"

    # Generate part markdown
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
quizTitle: "$(Yaml-Escape $Title) — Part $(To-Roman $n)"
quizIntro: "Can you see through the veil of $(To-Roman $n)?"
seriesMeta:
  number: $SeriesNo
  label: "Series $SeriesNo"
  series_version: $SeriesVersion

# Visibility
sitemap: true
discussEnabled: true
referencesEnabled: true
seriesNavEnabled: true
quizEnabled: true
lensEnabled: true
creativePromptEnabled: true
discussionPromptEnabled: true

# ⚯ Synergist Lens data
crossLinks: []
vaultRefs: []
communityThreads: []
relatedProducts: []

# 🎨 Creative Prompt
creativePrompt:
  text: "Write or create something inspired by the hidden light in this part of the series. Title it <em>&ldquo;TBC.&rdquo;</em>"
  sharePrompt: "What truth or memory is awakening in you?"

# 🗣 Discussion Prompt
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
    - term: "TBC"
      def: "TBC"
    - term: "TBC"
      def: "TBC"

# 📚 References
references:
  title: "Sources & Study Path"
  intro: "For those wishing to go deeper..."
  readings:
    - title: "TBC"
      desc: "TBC"
    - title: "TBC"
      desc: "TBC"
  scholarly:
    - author: "TBC"
      year: "TBC"
      work: "TBC"
      pub: "TBC"
    - author: "TBC"
      year: "TBC"
      work: "TBC"
      pub: "TBC"

# 🧭 Breadcrumbs
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

  <blockquote class="blockquote">
    <em>EXAMPLE in English: “I am God, and there is no other beside me.”</em><br>
    <cite>
      Yaldabaoth, <em>Apocryphon of John</em>.
      <a href="/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/apocryphon-of-john/" target="_blank" rel="noopener noreferrer">Source</a>
    </cite>
  </blockquote>

  <figure class="image-block">
    <picture>
      <source srcset="{{ imgBase }}/{{ imgPrefix }}placeholder.webp" type="image/webp">
      <img src="{{ imgBase }}/{{ imgPrefix }}placeholder.jpg" alt="Placeholder image" class="image-gnostic" loading="lazy">
    </picture>
    <figcaption class="caption-gnostic">Caption for image placeholder.</figcaption>
  </figure>

  <section class="section-block">
    <h2 class="section-heading">⚡ TL;DR</h2>
    <ul class="list-emoji">
      <li>Key insight 1</li>
      <li>Key insight 2</li>
      <li>Key insight 3</li>
      <li>Key insight 4</li>
      <li>Key insight 5</li>
    </ul>
  </section>

  {% include "partials/creative-prompt.njk" %}
  {% include "partials/discussion-prompt.njk" %}
  {% include "partials/quiz-block.njk" %}
  {% include "partials/glossary-block.njk" %}
  {% include "partials/reference-section.njk" %}

  <!-- ∞ Synergist Lens -->
  {% include "partials/synergist-lens.njk" %}

  {% include "partials/episode-part-nav.njk" %}

  <div class="gnostic-divider">
    <span class="divider-symbol pillar-glyph spin" aria-hidden="true">⛪︎</span>
  </div>

  </section>
</main>
"@
    $partDir = Join-Path $EPISODE_DIR $partSlug
    Ensure-Dir $partDir
    $mdPath = Join-Path $partDir "index.md"
    Safe-WriteFile -Path $mdPath -Content $frontMatter -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force
    Write-Host ("🧾 Part {0}: {1}" -f (To-Roman $n), $mdPath)

    # Generate quiz files for each part
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
    title: "$(Yaml-Escape $Title) — Part $(To-Roman $n)"
  },
  questions: [
    {
      id: "q1",
      prompt: "Placeholder question for $(Yaml-Escape $Title) — Part $(To-Roman $n).",
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
        Safe-WriteFile -Path $quizFile -Content $quizStub -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force
        Write-Host "🧪 Quiz stub: $quizFile"

        # Append to quiz index
        $relPath = "./$PillarSlug/$SeriesSlug/series-$SeriesNo/$quizId.js"
        $importName = ($quizId -replace '[-]', '_')
        if ($indexContent -notmatch [regex]::Escape($relPath)) {
            $importLine = "import $importName from '$relPath';"
            if ($indexContent -notmatch 'import ') {
                $indexContent = "// Auto-generated TGK Quiz Index — Clean v2.3`n$importLine`n`n$indexContent"
            } else {
                $indexContent = $indexContent -replace '^(// Auto-generated TGK Quiz Index[^\n]*\n)(import[^\n]*\n)*', "`$1$importLine`n"
            }

            if ($indexContent -notmatch 'export\s+default\s*\{') {
                $indexContent = $indexContent.TrimEnd() + "`n`nexport default {`n};`n"
            }

            $mapping = "  [$importName.meta.quizId]: $importName,"
            $indexContent = $indexContent -replace 'export\s+default\s*\{', "export default {\n$mapping"
            Safe-WriteFile -Path $QUIZ_INDEX -Content $indexContent -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force
            Write-Host "🧷 Appended quiz to index: $QUIZ_INDEX"
        } else {
            Write-Host "ℹ️ Quiz already present: $quizId"
        }
    }

    # Generate image folders for each part
    if ($WithImages.IsPresent) {
        $mediaDir = Join-Path $MEDIA_ROOT $partSlug
        Ensure-Dir $mediaDir
        1..2 | ForEach-Object {
            $jpg = Join-Path $mediaDir "$($Slug)-placeholder-$($_).jpg"
            $webp = Join-Path $mediaDir "$($Slug)-placeholder-$($_).webp"
            [System.IO.File]::WriteAllBytes($jpg, @())
            [System.IO.File]::WriteAllBytes($webp, @())
            Write-Host "🖼  Created placeholder: $jpg"
            Write-Host "🖼  Created placeholder: $webp"
        }
        Write-Host "🖼  Media folder created: $mediaDir"
    }
}

# Synergy Builder
class SynergyNode {
    [string]$id; [string]$title; [string]$url; [string]$pillar; [string]$series
    [string]$episode; [string]$part; [string]$tier; [string]$type
}

class SynergyEdge {
    [string]$source; [string]$target; [string]$relation
}

function Build-SynergyMap {
    param([Parameter(Mandatory)][string]$Root)

    $src = Join-Path $Root "src"
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
            if ($yaml -match "^(?ms)$key\s*:\s*(.+?)$") { return ($Matches[1].Trim()) }
            return $null
        }

        $title = (YGet "title") -replace '^"|"$', ''
        $permalink = (YGet "permalink") -replace '^"|"$', ''
        $pillar = (YGet "pillar") -replace '^"|"$', ''
        $series = (YGet "series") -replace '^"|"$', ''
        $tier = (YGet "tier") -replace '^"|"$', ''
        $scrollId = (YGet "scrollId") -replace '^"|"$', ''
        $episodeId = (YGet "episodeId") -replace '^"|"$', ''
        $partId = (YGet "partId") -replace '^"|"$', ''

        if (-not $scrollId) { $scrollId = $permalink }

        $node = [SynergyNode]::new()
        $node.id = $scrollId; $node.title = $title; $node.url = $permalink
        $node.pillar = $pillar; $node.series = $series
        $node.episode = $episodeId; $node.part = $partId
        $node.tier = $tier; $node.type = "scroll"
        $nodes.Add($node) | Out-Null

        function Extract-Array([string]$name) {
            if ($yaml -match "(?ms)^$name\s*:\s*\[(.*?)\]") {
                $inner = $Matches[1]
                $items = @()
                foreach ($m in ([regex]::Matches($inner, '"([^"]+)"'))) { $items += $m.Groups[1].Value }
                return ,$items
            } elseif ($yaml -match "(?ms)^$name\s*:\s*\-\s*(.+)") {
                $list = @()
                $block = $yaml.Substring($yaml.IndexOf("${name}:"))         
                foreach ($line in $block.Split("`n")) {
                    if ($line -match "^\s*-\s*title:") { $list += $null; continue }
                    if ($line -match '^\s*path:\s*"([^"]+)"') { $list[-1] = $Matches[1] }
                    elseif ($line -match '^\s*-\s*"([^"]+)"') { $list += $Matches[1] }
                    elseif ($line -match '^\s*-\s*(/[\w\-/]+)') { $list += ($line.Trim() -replace '^\s*-\s*', '') }
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

        foreach ($t in $cross) { $edges.Add([SynergyEdge]@{source = $node.id; target = $t; relation = "crossLink"}) | Out-Null }
        foreach ($t in $vault) { $edges.Add([SynergyEdge]@{source = $node.id; target = $t; relation = "vaultRef"}) | Out-Null }
        foreach ($t in $community) { $edges.Add([SynergyEdge]@{source = $node.id; target = $t; relation = "community"}) | Out-Null }
        foreach ($t in $products) { $edges.Add([SynergyEdge]@{source = $node.id; target = $t; relation = "product"}) | Out-Null }
    }

    $payload = [ordered]@{
        generatedAt = (Get-Date).ToString("s")
        nodes       = $nodes
        edges       = $edges
    } | ConvertTo-Json -Depth 6

    Safe-WriteFile -Path $outFile -Content $payload -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force
    Write-Host "🗺  Synergy map written: $outFile"
}

if (-not $Quick.IsPresent) {
    Write-Host "⚯ Building Synergy Map (global)..."
    Build-SynergyMap -Root $Root
} else {
    Write-Host "⏭  Skipping synergy map rebuild (-Quick)"
}

Write-Host "✅ Done."