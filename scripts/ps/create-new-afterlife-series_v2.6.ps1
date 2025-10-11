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
  [string] $Glyph = '✝',
  [string] $BodyClass = 'gold',
  [int]    $SeriesVersion = 1,
  [string] $LandingDescription = "Three-part journey.",
  [string] $Root = '.',

  # ===== Feature flags =====
  [switch] $WithQuizzes,
  [switch] $WithImages,

  # ===== Optional hooks (default off) =====
  [switch] $BuildSynergy,      # keep builder as a hook; off by default

  # ===== Safety =====
  [switch] $ConfirmOverwrite,  # backup .bak then overwrite existing files
  [switch] $Force,             # overwrite without backup/confirm
  [switch] $WhatIf             # simulate without writing files
)

# ----------------------------- Input Validation -----------------------------------
function Sanitize-Slug([string]$Slug) {
    if ([string]::IsNullOrWhiteSpace($Slug)) {
        Write-Error "Slug cannot be empty or whitespace."
        exit 1
    }
    $invalidChars = [System.IO.Path]::GetInvalidFileNameChars() -join ''
    $regex = "[$([regex]::Escape($invalidChars))]"
    if ($Slug -match $regex) {
        Write-Error "Slug '$Slug' contains invalid characters for file paths."
        exit 1
    }
    return $Slug
}

# Validate inputs
$PillarSlug = Sanitize-Slug $PillarSlug
$SeriesSlug = Sanitize-Slug $SeriesSlug
$Slug = Sanitize-Slug $Slug
if ($SeriesNo -lt 1) { Write-Error "SeriesNo must be a positive integer."; exit 1 }
if ($Episode -lt 1) { Write-Error "Episode must be a positive integer."; exit 1 }
if (-not (Test-Path -LiteralPath $Root)) { Write-Error "Root path '$Root' does not exist."; exit 1 }

# ----------------------------- Style -----------------------------------
if (-not $PSStyle) { $PSStyle = [PSCustomObject]@{ Foreground = @{}; Reset = "" } }
function Info ($m) { Write-Host "• $m"; if (-not $WhatIf) { Add-Content -Path $logFile -Value "[INFO] $m" } }
function Done ($m) { Write-Host "$($PSStyle.Foreground.BrightGreen)✔$($PSStyle.Reset) $m"; if (-not $WhatIf) { Add-Content -Path $logFile -Value "[DONE] $m" } }
function Warn ($m) { Write-Warning "$m"; if (-not $WhatIf) { Add-Content -Path $logFile -Value "[WARN] $m" } }
function Err ($m) { Write-Error "$m"; if (-not $WhatIf) { Add-Content -Path $logFile -Value "[ERROR] $m" } }

# --------------------------- Helpers -----------------------------------
function Ensure-Dir([string]$Path) {
    if (!(Test-Path -LiteralPath $Path)) {
        if ($WhatIf) { Info "[WhatIf] Would create directory: $Path"; return }
        New-Item -ItemType Directory -Path $Path -ErrorAction Stop | Out-Null
    }
}

function Write-Utf8File {
    param([string]$Path, [string]$Content)
    $dir = Split-Path -Parent $Path
    if ($dir) { Ensure-Dir $dir }
    if ($WhatIf) { Info "[WhatIf] Would write to: $Path"; return }
    try {
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
    } catch {
        Err "Failed to write file '$Path': $($_.Exception.Message)"
        throw
    }
}

function Write-FileSafely {
    param(
        [Parameter(Mandatory=$true)][string]$Path,
        [Parameter(Mandatory=$true)][string]$Content,
        [switch]$ConfirmOverwrite,
        [switch]$Force,
        [switch]$WhatIf
    )
    $exists = Test-Path -LiteralPath $Path
    if ($exists -and -not $Force -and -not $ConfirmOverwrite) {
        Warn "SKIP (exists): $Path (use -ConfirmOverwrite to backup+overwrite, or -Force to overwrite)"
        return $false
    }
    if ($exists -and $ConfirmOverwrite -and -not $Force) {
        $bak = "$Path.bak.$((Get-Date).ToString('yyyyMMdd-HHmmss'))"
        if ($WhatIf) { Info "[WhatIf] Would back up: $Path to $bak" }
        else { Copy-Item -LiteralPath $Path -Destination $bak -Force; Info "Backed up existing → $bak" }
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
function To-Roman([int]$n) { switch ($n) { 1{'I'} 2{'II'} 3{'III'} 4{'IV'} 5{'V'} 6{'VI'} default { $n.ToString() } } }
function Part-Slug([int]$n) { "part-$n" }
function Part-Id([int]$n) { "part$n" }

# ------------------------- Paths & IDs ----------------------------------
$logFile = "afterlife-generator-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
$SRC = Join-Path $Root "src"
$PILLAR_DIR = Join-Path $SRC "pillars\$PillarSlug"
$GROUP_DIR = Join-Path $PILLAR_DIR "$SeriesSlug"
$SERIES_DIR = Join-Path $GROUP_DIR "series-$SeriesNo"
$EPISODE_DIR = Join-Path $SERIES_DIR "$Slug"
$MEDIA_ROOT = Join-Path $SRC "media\$PillarSlug\$SeriesSlug\series-$SeriesNo\$Slug"
$QUIZ_ROOT = Join-Path $SRC "_data\quiz"
$QUIZ_SERIES = Join-Path $QUIZ_ROOT "$PillarSlug\$SeriesSlug\series-$SeriesNo"
$QUIZ_INDEX = Join-Path $QUIZ_ROOT "index.js"

$seriesId = "$SeriesSlug-s$SeriesNo"   # e.g., the-afterlife-s1
$episodeId = $Slug                      # e.g., sufi-islam

# ------------------------------ Banner ----------------------------------
Write-Host ""
Write-Host "$($PSStyle.Foreground.BrightCyan)⛭ TGK Afterlife Generator v2.6$($PSStyle.Reset)"
Write-Host "  Pillar: $PillarSlug  Series: $SeriesSlug  #$SeriesNo  Episode $Episode — $Title"
Write-Host ""

# =========================================================================
# 1) PILLAR  — src/pillars/<pillar>/index.11tydata.js
# =========================================================================
Ensure-Dir $PILLAR_DIR
$pillarIndexPath = Join-Path $PILLAR_DIR "index.11tydata.js"
if (-not (Test-Path $pillarIndexPath)) {
    $pillarIndex = @"
export default {
  // 🕍 Pillar Metadata
  pillarId: "$PillarSlug",
  pillarName: "The Teachings",
  pillarUrl: "/pillars/$PillarSlug/",
  pillarGlyph: "⛪︎",
  accent: "gold",

  // 🌍 Series Grid
  pillarGrid: [
    {
      href: "/pillars/$PillarSlug/$SeriesSlug/",
      title: "The Afterlife Series",
      glyph: "☥",
      desc: "Maps of death, rebirth, and remembrance across traditions.",
      tier: "free",
      state: "active"
    }
  ],

  // 🧭 Computed Breadcrumbs
  eleventyComputed: {
    breadcrumbs: () => [
      { title: "The Gnostic Key", url: "/" },
      { title: "The Teachings", url: "/pillars/the-teachings/" }
    ]
  }
};
"@
    Write-FileSafely -Path $pillarIndexPath -Content $pillarIndex -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force -WhatIf:$WhatIf | Out-Null
    Done "Pillar index.11tydata.js created"
} else { Info "Pillar index.11tydata.js exists" }

# =========================================================================
# 2) GROUP  — src/pillars/<pillar>/<series>/index.11tydata.js
# =========================================================================
Ensure-Dir $GROUP_DIR
$groupIndexPath = Join-Path $GROUP_DIR "index.11tydata.js"
if (-not (Test-Path $groupIndexPath)) {
    $groupIndex = @"
export default {
  // 🜂 Series Collection Overview
  introText:
    "Sacred teachings from Gnostic, mystical, and ancient traditions — maps for life, death, and beyond.",

  pillarId: "$PillarSlug",
  pillarName: "The Teachings",
  pillarUrl: "/pillars/$PillarSlug/$SeriesSlug/",
  pillarGlyph: "✝",
  accent: "gold",

  // 🧩 Series Grid
  pillarGrid: [
    {
      href: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/",
      title: "The Afterlife — Series $SeriesNo",
      glyph: "☥",
      tagline: "The false cosmos, Christ the Revealer, and the soul’s return.",
      tier: "free",
      state: "active"
    }
  ],

  // 🧭 Computed Data
  eleventyComputed: {
    breadcrumbs: () => [
      { title: "The Gnostic Key", url: "/" },
      { title: "The Teachings", url: "/pillars/the-teachings/" },
      { title: "The Afterlife", url: "/pillars/the-teachings/the-afterlife/" }
    ]
  }
};
"@
    Write-FileSafely -Path $groupIndexPath -Content $groupIndex -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force -WhatIf:$WhatIf | Out-Null
    Done "Group index.11tydata.js created"
} else { Info "Group index.11tydata.js exists" }

# =========================================================================
# 3) SERIES — src/pillars/<pillar>/<series>/series-<n>/index.11tydata.js
# =========================================================================
Ensure-Dir $SERIES_DIR
$seriesIndexPath = Join-Path $SERIES_DIR "index.11tydata.js"
if (-not (Test-Path $seriesIndexPath)) {
    $seriesIndex = @"
export default {
  // 🌌 Series Overview
  landing: {
    title: "The Afterlife — Series $SeriesNo",
    description:
      "Three-part journey through the false cosmos, the Revealer, and the soul’s return."
  },

  introText: "Choose an episode — each path reveals a different face of the afterlife.",

  // 🔹 Series Identity
  pillar: "$PillarSlug",
  series: "$SeriesSlug",
  seriesMeta: {
    number: $SeriesNo,
    label: "Series $SeriesNo",
    series_version: $SeriesVersion
  },

  // 🜂 Episode Grid (visible cards)
  pillarGrid: [
    {
      href: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/gnostic-christianity/",
      title: "Gnostic Christianity",
      glyph: "✝",
      tagline: "The false cosmos ✦ Christ the Revealer ✦ the soul’s return.",
      tier: "free",
      state: "active"
    },
    {
      href: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/sufi-islam/",
      title: "Sufi Islam",
      glyph: "☪",
      tagline: "The seeker’s path through love, annihilation, and return.",
      tier: "free",
      state: "active"
    }
  ],

  // 🧭 Cross-Episode Navigation (series map)
  seriesNav: [
    {
      title: "Gnostic Christianity",
      desc: "The false cosmos ✦ Christ the Revealer ✦ the soul’s return.",
      url: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/"
    },
    {
      title: "Sufi Islam",
      desc: "The seeker’s path through love, annihilation, and return.",
      url: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/"
    }
  ],

  // 🧭 Breadcrumbs (computed)
  eleventyComputed: {
    breadcrumbs: () => [
      { title: "The Gnostic Key", url: "/" },
      { title: "The Teachings", url: "/pillars/the-teachings/" },
      { title: "The Afterlife", url: "/pillars/the-teachings/the-afterlife/" },
      { title: "Series $SeriesNo", url: "/pillars/the-teachings/the-afterlife/series-$SeriesNo/" }
    ]
  }
};
"@
    Write-FileSafely -Path $seriesIndexPath -Content $seriesIndex -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force -WhatIf:$WhatIf | Out-Null
    Done "Series index.11tydata.js created"
} else { Info "Series index.11tydata.js exists" }

# =========================================================================
# 4) EPISODE — src/pillars/<pillar>/<series>/series-<n>/<episode>/index.11tydata.js
# =========================================================================
Ensure-Dir $EPISODE_DIR
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
    "<p>Interpretations vary across Gnostic schools and manuscripts within this pillar and series.</p>",

  // 🔹 Episode Parts (for dynamic part navigation)
  episodeParts: [
    {
      title: "Part I",
      desc: "The false cosmos, Sophia’s fall, and the hidden map of return.",
      url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-1/"
    },
    {
      title: "Part II",
      desc: "The hidden Christ awakens the divine spark within the soul.",
      url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-2/"
    },
    {
      title: "Part III",
      desc: "Through the toll gates of death, the awakened soul remembers its home.",
      url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-3/"
    }
  ],

  // 🔹 Series Navigation (cross-episode buttons)
  seriesNav: [
    { title: "Gnostic Christianity", desc: "The false cosmos ✦ Christ the Revealer ✦ the soul’s return.", url: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/" },
    { title: "Sufi Islam", desc: "Three-part journey through the false cosmos and the Revealer.", url: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/" }
  ],

  // 🧭 Scroll Grid Cards (episode landing page)
  pillarGrid: [
    {
      href: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-1/",
      title: "Part I — The World Is Not What It Seems",
      glyph: "$Glyph",
      tagline: "The hidden God ✦ Sophia’s fall ✦ the Demiurge ✦ the spark within.",
      tier: "$Tier",
      state: "default"
    },
    {
      href: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-2/",
      title: "Part II — The Revealer and the Spark",
      glyph: "$Glyph",
      tagline: "From the false god to the forgotten light ✦ the Christ of Gnosis.",
      tier: "$Tier",
      state: "default"
    },
    {
      href: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-3/",
      title: "Part III — The Soul’s Return",
      glyph: "$Glyph",
      tagline: "The toll gates of the Archons ✦ the deathless spark ✦ the memory that frees the soul.",
      tier: "$Tier",
      state: "default"
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
    Write-FileSafely -Path $episodeDataPath -Content $episodeData -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force -WhatIf:$WhatIf | Out-Null
    Done "Episode index.11tydata.js created"
} else { Info "Episode index.11tydata.js exists" }

# =========================================================================
# 5) EPISODE LANDING — src/pillars/.../<episode>/index.njk
# =========================================================================
$episodeIndexNjkPath = Join-Path $EPISODE_DIR "index.njk"
if (-not (Test-Path $episodeIndexNjkPath)) {
    $episodeIndexNjk = @'
---
layout: base.njk
title: "{{ Title }}"
description: "Three-part journey."
tier: "{{ Tier }}"
glyph: "{{ Glyph }}"
permalink: "/pillars/{{ PillarSlug }}/{{ SeriesSlug }}/series-{{ SeriesNo }}/{{ Slug }}/index.html"
---

{% block head %}
  {% set socialImage = "/tgk-assets/images/share/{{ PillarSlug }}/{{ SeriesSlug }}/{{ Slug }}.jpg" %}
  {% include "partials/head-meta.njk" %}
  {% set items = pillarGrid %}
  {% set headline = "{{ Title }} — Series {{ SeriesNo }}" %}
  {% set base = "/pillars/{{ PillarSlug }}/{{ SeriesSlug }}/series-{{ SeriesNo }}/{{ Slug }}/" %}
  {% include "partials/jsonld-collection.njk" %}
{% endblock %}

<main class="main-content">
  <section class="content-container">
    <h2 class="section-heading">{{ Title }} — Series {{ SeriesNo }}</h2>
    <p class="section-subtitle">Explore each part of this journey:</p>

    {% include "partials/pillar-grid.njk" %}

    <div class="gnostic-divider">
      <span class="divider-symbol pillar-glyph spin glow" aria-hidden="true">{{ glyph or pillarGlyph }}</span>
    </div>
  </section>
</main>
'@
    # Closing '@ must be on its own line, no spaces before it
    Write-FileSafely -Path $episodeIndexNjkPath `
        -Content $episodeIndexNjk `
        -ConfirmOverwrite:$ConfirmOverwrite `
        -Force:$Force `
        -WhatIf:$WhatIf | Out-Null
    Done "Episode index.njk created"
} else {
    Info "Episode index.njk exists"
}

# =========================================================================
# 6) PARTS — part-1, part-2, part-3 (index.md with LENS HOOKS ONLY)
# =========================================================================
$parts = 1..3
foreach ($n in $parts) {
    $partSlug = Part-Slug $n
    $partDir = Join-Path $EPISODE_DIR $partSlug
    Ensure-Dir $partDir

    $permalink = "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/$partSlug/index.html"
    $imgBase = "/media/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/$partSlug"
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
quizTitle: "$(Yaml-Escape $Title) — Part $(To-Roman $n)"
quizIntro: "Can you see through the veil of $(To-Roman $n)?"
seriesMeta:
  number: $SeriesNo
  label: "Series $SeriesNo"
  series_version: $SeriesVersion

# Visibility
discussEnabled: true
resourcesEnabled: true
seriesNavEnabled: true
quizEnabled: true
lensEnabled: true
creativePromptEnabled: false
discussionPromptEnabled: true

# ⚯ Synergist Lens hooks (leave arrays empty; another tool populates them)
crossLinks: []
vaultRefs: []
communityThreads: []
relatedProducts: []

# 🎨 Creative Prompt (optional; section hidden if empty)
creativePrompt:
  text: ""
  sharePrompt: ""

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
    Write-FileSafely -Path $mdPath -Content $frontMatter -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force -WhatIf:$WhatIf | Out-Null
    Done ("Part {0}: {1}" -f (To-Roman $n), $mdPath)

    # Media placeholders (optional)
    if ($WithImages.IsPresent) {
        $mediaDir = Join-Path $MEDIA_ROOT $partSlug
        Ensure-Dir $mediaDir
        1..2 | ForEach-Object {
            $jpg = Join-Path $mediaDir "$($Slug)-placeholder-$($_).jpg"
            $webp = Join-Path $mediaDir "$($Slug)-placeholder-$($_).webp"
            if ($WhatIf) {
                Info "[WhatIf] Would create placeholder: $jpg"
                Info "[WhatIf] Would create placeholder: $webp"
            } else {
                [System.IO.File]::WriteAllBytes($jpg, [byte[]]@())
                [System.IO.File]::WriteAllBytes($webp, [byte[]]@())
                Info "Media placeholder → $jpg"
                Info "Media placeholder → $webp"
            }
        }
        Info "Media folder ready: $mediaDir"
    }

    # Quiz stubs (optional)
    if ($WithQuizzes.IsPresent) {
        Ensure-Dir $QUIZ_SERIES
        Ensure-Dir (Split-Path -Parent $QUIZ_INDEX)

        if (!(Test-Path $QUIZ_INDEX)) {
            $init = @"
// Auto-generated by TGK Afterlife Generator 2.6
export default {};
"@
            Write-Utf8File -Path $QUIZ_INDEX -Content $init
            Info "Initialized quiz index → $QUIZ_INDEX"
        }

        $quizId = "$($seriesId)-$($episodeId)-$($partSlug)"
        $quizFile = Join-Path $QUIZ_SERIES "$quizId.js"
        $importName = ($quizId -replace '[^\w]','_')
        $relPath = "./$PillarSlug/$SeriesSlug/series-$SeriesNo/$quizId.js"

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
        Write-FileSafely -Path $quizFile -Content $quizStub -ConfirmOverwrite:$ConfirmOverwrite -Force:$Force -WhatIf:$WhatIf | Out-Null
        Done "Quiz stub created: $quizFile"

        # Wire into global quiz index
        $indexSource = Get-Content $QUIZ_INDEX -Raw -ErrorAction SilentlyContinue
        if ($indexSource -notmatch [regex]::Escape($relPath)) {
            if ($indexSource -notmatch 'export\s+default') {
                $indexSource = "// Auto-generated by TGK Afterlife Generator 2.6`nexport default {};"
            }
            $importLine = "import $importName from '$relPath';"
            if ($indexSource -notmatch '^\s*import') {
                $indexSource = "$importLine`n`n$indexSource"
            } else {
                $indexSource = $indexSource -replace '^(import[^\n]*\n)*', ("$&$importLine`n")
            }
            if ($indexSource -notmatch 'export\s+default\s*\{') {
                $indexSource = $indexSource.TrimEnd() + "`n`nexport default {`n};`n"
            }
            $indexSource = $indexSource -replace 'export\s+default\s*\{', "export default {`n  [$importName.meta.quizId]: $importName,"
            Write-Utf8File -Path $QUIZ_INDEX -Content $indexSource
            Done "Registered in quiz index: $quizId"
        } else {
            Info "Quiz already present in index: $quizId"
        }
    }
}

# =========================================================================
# 7) (Optional) Synergy Map Builder — kept as a HOOK, OFF by default
# =========================================================================
class SynergyNode {
    [string]$id; [string]$title; [string]$url; [string]$pillar; [string]$series
    [string]$episode; [string]$part; [string]$tier; [string]$type
}
class SynergyEdge { [string]$source; [string]$target; [string]$relation }

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
        try {
            $raw = Get-Content $f.FullName -Raw -ErrorAction Stop
            if ($raw -notmatch '(?s)^---\s*(.*?)\s*---') {
                Warn "Skipping '$($f.FullName)': No valid front-matter found."
                continue
            }
            $yaml = [regex]::Match($raw, '(?s)^---\s*(.*?)\s*---').Groups[1].Value

            function YGet([string]$key) {
                $pattern = "(?m)^\s*$key\s*:\s*(.+)$"
                $match = [regex]::Match($yaml, $pattern)
                if ($match.Success) { return ($match.Groups[1].Value.Trim()) } else { return $null }
            }

            $title = (YGet "title") -replace '^"|"$',''
            $permalink = (YGet "permalink") -replace '^"|"$',''
            $pillar = (YGet "pillar") -replace '^"|"$',''
            $series = (YGet "series") -replace '^"|"$',''
            $tier = (YGet "tier") -replace '^"|"$',''
            $scrollId = (YGet "scrollId") -replace '^"|"$',''
            $episodeIdY = (YGet "episodeId") -replace '^"|"$',''
            $partIdY = (YGet "partId") -replace '^"|"$',''
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

            foreach ($t in (Extract-Array "crossLinks")) { $edges.Add([SynergyEdge]@{source=$node.id; target=$t; relation="crossLink"}) | Out-Null }
            foreach ($t in (Extract-Array "vaultRefs")) { $edges.Add([SynergyEdge]@{source=$node.id; target=$t; relation="vaultRef"}) | Out-Null }
            foreach ($t in (Extract-Array "communityThreads")) { $edges.Add([SynergyEdge]@{source=$node.id; target=$t; relation="community"}) | Out-Null }
            foreach ($t in (Extract-Array "relatedProducts")) { $edges.Add([SynergyEdge]@{source=$node.id; target=$t; relation="product"}) | Out-Null }
        } catch {
            Warn "Failed to process '$($f.FullName)': $($_.Exception.Message)"
            continue
        }
    }

    $payload = [ordered]@{
        generatedAt = (Get-Date).ToString("s")
        nodes = $nodes
        edges = $edges
    } | ConvertTo-Json -Depth 6

    Write-Utf8File -Path $outFile -Content $payload
    Done "Synergy map written: $outFile"
}

if ($BuildSynergy.IsPresent) {
    Info "⚯ Building Synergy Map (global)…"
    Build-SynergyMap -Root $Root
} else {
    Info "Synergy build skipped (use -BuildSynergy to enable)."
}

# =========================================================================
# 8) FINISH
# =========================================================================
Done "All tasks complete."