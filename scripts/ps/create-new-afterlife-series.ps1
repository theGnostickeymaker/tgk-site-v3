param(
  # Required
  [Parameter(Mandatory)] [string] $PillarSlug,
  [Parameter(Mandatory)] [string] $SeriesSlug,
  [Parameter(Mandatory)] [int]    $SeriesNo,
  [Parameter(Mandatory)] [string] $Slug,
  [Parameter(Mandatory)] [string] $Title,
  [Parameter(Mandatory)] [int]    $Episode,

  # Optional
  [ValidateSet('free','initiate','full')]
  [string] $Tier = 'free',
  [string] $Glyph = '⛪︎',
  [string] $BodyClass = 'gold',
  [string] $SeriesGroup = "Series",
  [int]    $SeriesVersion = 1,
  [string] $LandingDescription = "Three-part journey.",
  [string] $Root = '.',
  [switch] $WithQuizzes
)

# Resolve root path
if (-not $PSBoundParameters.ContainsKey('Root') -or [string]::IsNullOrWhiteSpace($Root) -or $Root -eq '.') {
  $Root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
}


# Helpers
function Write-Utf8File($Path, $Content) {
  $parent = Split-Path -Path $Path -Parent
  [System.IO.Directory]::CreateDirectory($parent) | Out-Null
  $utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBOM)
}

function Roman([int]$n){
  $map = @{1='I';2='II';3='III';4='IV';5='V';6='VI';7='VII';8='VIII';9='IX';10='X'}
  return $map[$n]
}

function To-TitleCase([string]$s){
  if ([string]::IsNullOrWhiteSpace($s)) { return $s }
  $parts = $s -split '[-\s]' | Where-Object { $_ -ne "" }
  return ($parts | ForEach-Object { $_.Substring(0,1).ToUpper() + $_.Substring(1).ToLower() }) -join " "
}

# Derived
$seriesKey   = "$SeriesSlug-s$SeriesNo"
$PillarNameDefault = To-TitleCase $PillarSlug
$SeriesTitleDefault = To-TitleCase $SeriesSlug
$episodeRoot = Join-Path $Root "src/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug"
$SeriesDir   = Join-Path $Root "src/pillars/$PillarSlug/$SeriesSlug"
$mediaBase   = "/media/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug"
$socialImage = "/tgk-assets/images/share/$PillarSlug/$SeriesSlug/$Slug.jpg"

# =========================
# Series HUB landing (/pillars/$PillarSlug/$SeriesSlug/)
# =========================
$PillarNameDefault  = To-TitleCase $PillarSlug
$SeriesTitleDefault = To-TitleCase $SeriesSlug
$SeriesHomeRoot     = Join-Path $Root "src/pillars/$PillarSlug/$SeriesSlug"

# Hub .11tydata.js (metadata)
$seriesHubData = @"
export default {
  eleventyComputed: {
    pillarId: () => "$PillarSlug",
    pillarName: () => "$PillarNameDefault",
    pillarUrl: () => "/pillars/$PillarSlug/$SeriesSlug/",
    pillarGlyph: () => "$Glyph",
    accent: () => "$BodyClass",
    breadcrumbs: () => ([
      { title: "The Gnostic Key", url: "/" },
      { title: "$PillarNameDefault", url: "/pillars/$PillarSlug/" },
      { title: "$SeriesTitleDefault", url: "/pillars/$PillarSlug/$SeriesSlug/" }
    ])
  }
};
"@
Write-Utf8File (Join-Path $SeriesHomeRoot ".11tydata.js") $seriesHubData

# Hub index.11tydata.js → SERIES cards
$hubFile = Join-Path $SeriesHomeRoot "index.11tydata.js"

$newSeriesCard = @"
    {
      href: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/",
      title: "$SeriesTitleDefault — Series $SeriesNo",
      glyph: "$Glyph",
      tagline: "$LandingDescription",
      status: "$Tier"
    }
"@

if (Test-Path $hubFile) {
  $existing = Get-Content $hubFile -Raw
  if ($existing -match 'pillarGrid: \[') {
    $updated = $existing -replace '(pillarGrid:\s*\[[\s\S]*?)(\n\s*\])', "`$1,`n$newSeriesCard`$2"
    Set-Content $hubFile $updated -Encoding UTF8
  }
} else {
  $seriesHubLanding = @"
export default { 
  introText: "Sacred teachings from Gnostic, mystical, and ancient traditions — maps for life, death, and beyond.",
  pillarGrid: [
$newSeriesCard
  ]
};
"@
  Write-Utf8File $hubFile $seriesHubLanding
}

# Hub index.njk (template)
$seriesHubIndex = @"
---
layout: base.njk
title: "$SeriesTitleDefault"
permalink: "/pillars/$PillarSlug/$SeriesSlug/index.html"
tagline: "Mystical cartographies ✦ life, death, and beyond"

glyph: "$Glyph"
accent: "$BodyClass"
bodyClass: "$BodyClass"
---

{% block head %}
  {% set socialImage = "/tgk-assets/images/share/$PillarSlug/$SeriesSlug-index.jpg" %}
  {% include "partials/head-meta.njk" %}
{% endblock %}

<main class="main-content">

  <h4 class="index heading">
    Sacred teachings from Gnostic, mystical, and ancient traditions — maps for life, death, and beyond.
  </h4>

  <details class="disclaimer-box">
    <summary><span class="disclaimer-heading">🔑 What is The Gnostic Key?</span></summary>
    <p>
      <strong>The Gnostic Key</strong> is a sanctuary for seekers, rebels, and rememberers.
      It weaves together hidden teachings, forbidden truths, and symbolic insight across time, tradition, and taboo.
      Each pillar holds a different aspect of the mystery: spiritual maps, deep investigations, archetypal codes, and living scrolls.
      <br><br>
      This site is not a church. It is a <em>vault</em>, a <em>mirror</em>, and a <em>compass</em> — offered to those who refuse to forget.
    </p>
  </details>

  {% include "partials/pillar-grid.njk" %}

  {% set items = pillarGrid %}
  {% set headline = "$SeriesTitleDefault — Index" %}
  {% set base = page.url %}
  {% include "partials/jsonld-collection.njk" %}

  <div class="gnostic-divider">
    <span class="divider-symbol pillar-glyph spin glow" aria-hidden="true">{{ pillarGlyph }}</span>
  </div>
</main>
"@
Write-Utf8File (Join-Path $SeriesHomeRoot "index.njk") $seriesHubIndex

# =========================
# Series landing (/series-$SeriesNo/)
# =========================
$SeriesRoot = Join-Path $Root "src/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo"

# Series .11tydata.js (metadata)
$seriesDotData = @"
export default {
  layout: "base.njk",
  pillar: "$PillarSlug",
  series: "$SeriesSlug",
  seriesMeta: { number: $SeriesNo, label: "Series $SeriesNo", series_version: $SeriesVersion },
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "$PillarNameDefault", url: "/pillars/$PillarSlug/" },
    { title: "$SeriesTitleDefault", url: "/pillars/$PillarSlug/$SeriesSlug/" },
    { title: "Series $SeriesNo", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/" }
  ]
};
"@
Write-Utf8File (Join-Path $SeriesRoot ".11tydata.js") $seriesDotData

# Series index.11tydata.js → EPISODE cards
$seriesIndexPath = Join-Path $SeriesRoot "index.11tydata.js"

$newCard = @"
    {
      href: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/",
      title: "$Title",
      glyph: "$Glyph",
      tagline: "$LandingDescription",
      status: "$Tier"
    }
"@

if (Test-Path $seriesIndexPath) {
  $existing = Get-Content $seriesIndexPath -Raw
  if ($existing -match 'pillarGrid: \[') {
    $updated = $existing -replace '(pillarGrid:\s*\[[\s\S]*?)(\n\s*\])', "`$1,`n$newCard`$2"
    Set-Content -Path $seriesIndexPath -Value $updated -Encoding UTF8
  }
} else {
  $seriesCards = @"
export default {
  introText: "$SeriesTitleDefault, Series $SeriesNo — choose an episode:",
  pillarGrid: [
$newCard
  ]
};
"@
  Write-Utf8File $seriesIndexPath $seriesCards
}


# Series index.njk (template)
$seriesIndexNjk = @"
---
layout: base.njk
title: "$SeriesTitleDefault — Series $SeriesNo"
description: "$LandingDescription"
seriesMeta:
  number: $SeriesNo
  label: "Series $SeriesNo"
  series_version: $SeriesVersion
pillar: $PillarSlug
series: $SeriesSlug
permalink: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/index.html"

breadcrumbs:
  - { title: "The Gnostic Key", url: "/" }
  - { title: "$PillarNameDefault", url: "/pillars/$PillarSlug/" }
  - { title: "$SeriesTitleDefault", url: "/pillars/$PillarSlug/$SeriesSlug/" }
  - { title: "Series $SeriesNo", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/" }
---

<main class="main-content">

<h4 class="index heading">$LandingDescription</h4>

  {% include "partials/pillar-grid.njk" %}

  <div class="gnostic-divider">
    <span class="divider-symbol pillar-glyph spin glow" aria-hidden="true">{{ pillarGlyph }}</span>
  </div>

</main>
"@
Write-Utf8File (Join-Path $SeriesRoot "index.njk") $seriesIndexNjk


# =========================
# Episode-level .11tydata.js
# =========================
$episodeData = @"
export default {
  seriesLabel: "$SeriesGroup",
  pillarLabel: "$PillarSlug",
  glyphRow: ["$Glyph","𓂀","$Glyph"],
  seriesHome: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/",
  pillarHome: "/pillars/$PillarSlug/",
  episode: $Episode,
  tagline: "$Title, Episode $Episode tagline",
  seriesMeta: { number: $SeriesNo, label: "Series $SeriesNo", series_version: $SeriesVersion },
  episodeParts: [
    { title: "Part I — TBD", desc: "", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-1/" },
    { title: "Part II — TBD", desc: "", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-2/" },
    { title: "Part III — TBD", desc: "", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-3/" }
  ],
  layout: "base.njk",
  pillar: "$PillarSlug",
  series: "$SeriesSlug",
  eleventyComputed: {
    slug: (d) => d.slug || d.page.fileSlug,
    permalink: (d) => d.permalink || d.page.url,
    imgBase: (d) => d.imgBase || "$mediaBase",
    imgPrefix: (d) => d.imgPrefix || "$Slug-",
    socialImage: (d) => d.socialImage || "/pillars/$PillarSlug/$SeriesSlug/og/$Slug.jpg",
    breadcrumbsBase: (d) => [
      { title: "The Gnostic Key", url: "/" },
      { title: "$PillarNameDefault", url: "/pillars/$PillarSlug/" },
      { title: "$SeriesTitleDefault", url: "/pillars/$PillarSlug/$SeriesSlug/" },
      { title: "Series $SeriesNo", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/" },
      { title: "$Title", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/" }
    ],
    breadcrumbs: (d) => [ ...(d.breadcrumbsBase || []), d.title ? { title: d.title } : null ].filter(Boolean)
  }
};
"@
Write-Utf8File (Join-Path $episodeRoot "$Slug.11tydata.js") $episodeData


# =========================
# index.11tydata.js (landing)
# =========================
$landingData = @"
export default {
  introText: "$LandingDescription",
  tagline: "$LandingDescription",
  seriesMeta: { number: $SeriesNo, label: "Series $SeriesNo", series_version: $SeriesVersion },
  episode: $Episode,
  disclaimerTitle: "⚠️ Diversity of Sources",
  disclaimerText: "<p>Interpretations vary across schools and texts in this pillar/series.</p>",
  pillarGrid: [
    {
      href: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-1/",
      title: "Part I — TBD",
      glyph: "$Glyph",
      tagline: "$Title, Part I tagline",
      status: "$Tier"
    },
    {
      href: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-2/",
      title: "Part II — TBD",
      glyph: "$Glyph",
      tagline: "$Title, Part II tagline",
      status: "$Tier"
    },
    {
      href: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-3/",
      title: "Part III — TBD",
      glyph: "$Glyph",
      tagline: "$Title, Part III tagline",
      status: "$Tier"
    }
  ]
};
"@
Write-Utf8File (Join-Path $episodeRoot "index.11tydata.js") $landingData

# =========================
# index.njk
# =========================
$indexNjk = @"
---
layout: base.njk
title: "$Title"
description: "$LandingDescription"
tier: $Tier
series_version: $SeriesVersion
permalink: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/index.html"
tagline: "$LandingDescription"
seriesMeta:
  number: $SeriesNo
  label: "Series $SeriesNo"
  series_version: $SeriesVersion
episode: $Episode

breadcrumbs:
  - { title: "The Gnostic Key", url: "/" }
  - { title: "$PillarNameDefault", url: "/pillars/$PillarSlug/" }
  - { title: "$SeriesTitleDefault", url: "/pillars/$PillarSlug/$SeriesSlug/" }
  - { title: "Series $SeriesNo", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/" }
  - { title: "$Title", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/" }
---

{% block head %}
  {% set socialImage = "$socialImage" %}
  {% include "partials/head-meta.njk" %}
  {% set items = pillarGrid %}
  {% set headline = "$Title — Series $SeriesNo" %}
  {% set base = "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/" %}
  {% include "partials/jsonld-collection.njk" %}
{% endblock %}

<main class="main-content">

<h4 class="index heading">$LandingDescription</h4>

  {% include "partials/pillar-grid.njk" %}

  <div class="gnostic-divider">
    <span class="divider-symbol pillar-glyph spin glow" aria-hidden="true">{{ pillarGlyph }}</span>
  </div>

</main>
"@
Write-Utf8File (Join-Path $episodeRoot "index.njk") $indexNjk

# =========================
# Scroll Parts + Quiz Files
# =========================
for ($i = 1; $i -le 3; $i++) {
  $roman = Roman $i
  $partDir = Join-Path $episodeRoot "part-$i"
  $permalink = "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-$i/index.html"
  $social = "/media/share/$PillarSlug/$SeriesSlug/$Slug-part-$i.jpg"
  $imgBase = "$mediaBase/part-$i"
  $partId = "part$i"
  $quizId = "$SeriesSlug-s$SeriesNo-$Slug-part$i"

  $partMd = @"
---
layout: base.njk
title: "$Title — Part $roman"
description: ""
tier: $Tier
episode: $Episode
partNumeral: $roman
partTitle: "Part $roman — TBD"
tagline: "$Title, TBD"
slug: "part-$i"
permalink: "$permalink"
socialImage: "$social"
imgBase: "$imgBase"
imgPrefix: "$Slug-"
bodyClass: "$BodyClass"
glyph: "$Glyph"
seriesId: "$seriesKey"
episodeId: "$Slug"
partId: "$partId"
quizId: "$quizId"
seriesMeta:
  number: $SeriesNo
  label: "Series $SeriesNo"
  series_version: $SeriesVersion

breadcrumbs:
  - { title: "The Gnostic Key", url: "/" }
  - { title: "$PillarNameDefault", url: "/pillars/$PillarSlug/" }
  - { title: "$SeriesTitleDefault", url: "/pillars/$PillarSlug/$SeriesSlug/" }
  - { title: "Series $SeriesNo", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/" }
  - { title: "$Title", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/" }
  - { title: "Part $roman", url: "$permalink" }
---

<!-- ========================= PART $roman ========================= -->

<nav class="scroll-tabs" role="navigation" aria-label="Part Map">
  <a class="tab-link" href="#quiz"      data-title="Quiz">Quiz</a>
  <a class="tab-link" href="#glossary"  data-title="Glossary">Glossary</a>
  <a class="tab-link" href="#discuss"   data-title="Discussion">Discuss</a>
  <a class="tab-link" href="#series"    data-title="Series Map">Series Map</a>
</nav>

<main class="main-content">
<section class="content-container">

<details class="disclaimer-box">
  <summary>
    <span class="disclaimer-heading">⚠️ Previously in Part I/II/II etc</span>
  </summary>
  <p>TBD</p>
</details>

<section class="section-block">
  <p>Start writing Part $i here…</p>
</section>

<section class="section-block">
  <h2 class="section-heading">⚡ TL;DR:</h2>
  <ul class="list-emoji">
    <li>TBD</li>
    <li>TBD</li>
    <li>TBD</li>
  </ul>
</section>

<figure class="image-block">
  <picture>
    <source srcset="{{ imgBase }}/{{ imgPrefix }}gates-open-at-death.webp" type="image/webp">
    <img src="{{ imgBase }}/{{ imgPrefix }}gates-open-at-death.jpg" 
         alt="TBD" 
         class="image-gnostic" 
         loading="lazy">
  </picture>
  <figcaption class="caption-gnostic">TBC.
  </figcaption>
</figure>

<section class="section-block">
  <h2 class="section-heading">Chapter 1: TBC</h2>
    <p>For most of the dead</p>
    <h4 class="section-subheading">1. List Heading</h4>
    <h4 class="section-subheading">2. List Heading</h4>
    <h4 class="section-subheading">3. List Heading</h4>
</section>

<section class="section-block">
  <blockquote class="blockquote">
      <em>TBD</em>
    </blockquote>
  </section>
</section>

<section class="section-block" id="discuss">
  <h2 class="section-heading">🗣️ Discussion Prompt: </h2>
    <p>TBD</p>

    <div class="btn-wrap">
      <a href="https://t.me/thegnostickey" 
        target="_blank" 
        rel="noopener" 
        class="btn btn-outline" 
        aria-label="Join The Gnostic Key Telegram Channel">
        💬 Join the Temple on Telegram</a>
    </div>

    <div class="btn-wrap">
      <a href="https://x.com/thegnostickey" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="btn btn-outline"
        aria-label="Share this article on X (formerly Twitter)">
        📤 Send Your Spark to the Network on X</a>
    </div>
</section>

<section class="section-block" id="quiz">
  <h2 class="section-heading">🧠 Quiz</h2>
    <div id="quiz-container" data-quiz-id="{{ quizId }}"></div>
  {% include "partials/quiz-data-loader.njk" %}
</section>

<section class="section-block">
  <h2 class="section-heading">📖 Glossary</h2>
  <p class="section-subtitle">TBD</p>
  <dl class="glossary">
    <div class="glossary-entry">
      <dt>TBD</dt>
      <dd>TBD</dd>
    </div>
  </dl>
</section>

<section class="section-block" id="series">
  <h2 class="section-heading">📜 Episode Parts</h2>
  {% include "partials/episode-part-nav.njk" %}
</section>

{% include "partials/series-nav-buttons.njk" %}

<details class="disclaimer-box">
  <summary>
    <span class="disclaimer-heading">⚠️ Disclaimer</span>
  </summary>
  <p>TBD</p>
</details>

<div class="gnostic-divider">
  <span class="divider-symbol pillar-glyph spin" aria-hidden="true">$Glyph</span>
</div>
</section>

</main>
"@
  Write-Utf8File (Join-Path $partDir "index.md") $partMd

  if ($WithQuizzes) {
    $quizDir = Join-Path $Root "src/_data/quiz/$PillarSlug/$SeriesSlug/series-$SeriesNo"
    $quizPath = Join-Path $quizDir "$quizId.js"
    $quizJs = @"
export default {
  meta: {
    seriesId: "$seriesKey",
    episodeId: "$Slug",
    partId: "part$i",
    quizId: "$quizId"
  },
  intro: "Can you see through the first veil?",
  questions: [
    {
      id: "q1",
      prompt: "What is the core symbol or teaching emphasized in this part?",
      options: [
        { key: "A", label: "Material worship" },
        { key: "B", label: "Divine remembrance" },
        { key: "C", label: "Blind obedience" },
        { key: "D", label: "Pure chance" }
      ],
      answer: "B",
      explanation: "Each part points back to remembrance/insight beyond the surface."
    }
  ]
};
"@
    Write-Utf8File $quizPath $quizJs
  }
}

Write-Host "✅ Created full episode at: $episodeRoot"

# =========================
# Media Folders (src + tgk-assets mirror + placeholders)
# =========================
$mediaRootSrc   = Join-Path $Root "src/media/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug"
$mediaRootShare = Join-Path $Root "src/media/tgk-assets/$PillarSlug/$SeriesSlug/$Slug"

# Simple 1x1 px transparent PNG as base64
$pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
$pngBytes  = [Convert]::FromBase64String($pngBase64)

foreach ($dir in @($mediaRootSrc, $mediaRootShare)) {
  foreach ($i in 1..3) {
    $target = Join-Path $dir "part-$i"
    [System.IO.Directory]::CreateDirectory($target) | Out-Null

    # Placeholder names
    $jpgPath = Join-Path $target "placeholder.jpg"
    $webpPath = Join-Path $target "placeholder.webp"

    if (-not (Test-Path $jpgPath)) {
      [IO.File]::WriteAllBytes($jpgPath, $pngBytes)
    }
    if (-not (Test-Path $webpPath)) {
      [IO.File]::WriteAllBytes($webpPath, $pngBytes)
    }
  }
}

Write-Host "📂 Media + placeholder images prepared:"
Write-Host "   - $mediaRootSrc"
Write-Host "   - $mediaRootShare"


