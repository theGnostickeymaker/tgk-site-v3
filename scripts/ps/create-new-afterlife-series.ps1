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
  [switch] $WithQuizzes,

  # Card state
  [ValidateSet('default','coming-soon','draft','archived')]
  [string] $State = 'default'
)

# =========================
# Path + Helpers
# =========================
if (-not $PSBoundParameters.ContainsKey('Root') -or [string]::IsNullOrWhiteSpace($Root) -or $Root -eq '.') {
  $Root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
}

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

# =========================
# Derived Vars
# =========================
$seriesKey          = "$SeriesSlug-s$SeriesNo"
$PillarNameDefault  = To-TitleCase $PillarSlug
$SeriesTitleDefault = To-TitleCase $SeriesSlug
$episodeRoot        = Join-Path $Root "src/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug"
$SeriesHomeRoot     = Join-Path $Root "src/pillars/$PillarSlug/$SeriesSlug"
$SeriesRoot         = Join-Path $Root "src/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo"
$mediaBase          = "/media/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug"
$socialImage        = "/tgk-assets/images/share/$PillarSlug/$SeriesSlug/$Slug.jpg"

# =========================
# Series HUB landing (pillar-level directory)
# =========================

# .11tydata.js (only if missing)
$seriesHubDataPath = Join-Path $SeriesHomeRoot ".11tydata.js"
if (-not (Test-Path $seriesHubDataPath)) {
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
  Write-Utf8File $seriesHubDataPath $seriesHubData
} else {
  Write-Host "⚠️ Skipped existing: $seriesHubDataPath"
}

# Hub index.11tydata.js → append a SERIES card (or create file)
$hubFile = Join-Path $SeriesHomeRoot "index.11tydata.js"
$newSeriesCard = @"
    {
      href: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/",
      title: "$SeriesTitleDefault — Series $SeriesNo",
      glyph: "$Glyph",
      tagline: "$LandingDescription",
      tier: "$Tier",
      state: "$State"
    }
"@
if (Test-Path $hubFile) {
  $existing = Get-Content $hubFile -Raw
  $needle = [regex]::Escape("/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/")
  if ($existing -notmatch $needle) {
    $updated = $existing -replace '(pillarGrid:\s*\[[\s\S]*?)(\n\s*\])', "`$1,`n$newSeriesCard`$2"
    Set-Content $hubFile $updated -Encoding UTF8
    Write-Host "✅ Appended series card to: $hubFile"
  } else {
    Write-Host "⚠️ Skipped duplicate series card in: $hubFile"
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

# =========================
# Pillar Landing index.njk (only if missing)
# =========================
$pillarIndexPath = Join-Path $SeriesHomeRoot "index.njk"
if (-not (Test-Path $pillarIndexPath)) {
$pillarIndexNJK = @"
---
layout: base.njk
title: "$SeriesTitleDefault"
description: "Sacred teachings from Gnostic, mystical, and ancient traditions — maps for life, death, and beyond."
tier: free

glyph: "$Glyph"
glyphRow: ["$Glyph","$Glyph","$Glyph"]

permalink: "/pillars/$PillarSlug/$SeriesSlug/index.html"

breadcrumbs:
  - { title: "The Gnostic Key", url: "/" }
  - { title: "$PillarNameDefault", url: "/pillars/$PillarSlug/" }
  - { title: "$SeriesTitleDefault", url: "/pillars/$PillarSlug/$SeriesSlug/" }
---

{% block head %}
  {% set socialImage = "/tgk-assets/images/share/$PillarSlug/$SeriesSlug.jpg" %}
  {% include "partials/head-meta.njk" %}
{% endblock %}

<main class="main-content">
<section class="content-container">

<h4 class="index heading">
  Teachings that weave together ancient wisdom and living guidance — afterlife maps, rights scrolls, and paths of remembrance.
</h4>

<details class="disclaimer-box">
  <summary><span class="disclaimer-heading">🔑 About $SeriesTitleDefault</span></summary>
  <p>
    <strong>$SeriesTitleDefault</strong> gathers scrolls that explain and preserve: afterlife maps,
    rights of the people, and pathways of remembrance drawn from Gnostic, mystical, and ancient sources.
  </p>
</details>

{% include "partials/pillar-grid.njk" %}

<div class="gnostic-divider">
  <span class="divider-symbol pillar-glyph spin glow" aria-hidden="true">{{ pillarGlyph }}</span>
</div>

</main>
"@
  Write-Utf8File $pillarIndexPath $pillarIndexNJK
} else {
  Write-Host "⚠️ Skipped existing pillar landing page: $pillarIndexPath"
}

# =========================
# Series Landing (SeriesRoot)
# =========================
#
$seriesIndexNJKPath = Join-Path $SeriesRoot "index.njk"
if (-not (Test-Path $seriesIndexNJKPath)) {
$seriesIndexNJK = @"
---
layout: base.njk
title: "$SeriesTitleDefault — Series $SeriesNo"
description: "$LandingDescription"
tier: $Tier

glyph: "$Glyph"

seriesMeta:
  number: $SeriesNo
  label: "Series $SeriesNo"
  series_version: $SeriesVersion
permalink: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/index.html"

breadcrumbs:
  - { title: "The Gnostic Key", url: "/" }
  - { title: "$PillarNameDefault", url: "/pillars/$PillarSlug/" }
  - { title: "$SeriesTitleDefault", url: "/pillars/$PillarSlug/$SeriesSlug/" }
  - { title: "Series $SeriesNo", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/" }
---

{% block head %}
  {% set socialImage = "/tgk-assets/images/share/$PillarSlug/$SeriesSlug-series$SeriesNo.jpg" %}
  {% include "partials/head-meta.njk" %}
{% endblock %}

<main class="main-content">
<section class="content-container">

<h4 class="index heading">
  The first scroll cycle of the Afterlife Series — mapping death, rebirth, and the soul’s passage through the great traditions.
</h4>

<details class="disclaimer-box">
  <summary><span class="disclaimer-heading">☸ About Series $SeriesNo</span></summary>
  <p>
    <strong>Series $SeriesNo</strong> opens the journey with foundational maps of the beyond.
    These scrolls trace how ancient and mystical traditions charted the fate of the soul after death.
  </p>
</details>

{% include "partials/pillar-grid.njk" %}

<div class="gnostic-divider">
  <span class="divider-symbol pillar-glyph spin glow" aria-hidden="true">{{ pillarGlyph }}</span>
</div>

</main>
"@
  Write-Utf8File $seriesIndexNJKPath $seriesIndexNJK
} else {
  Write-Host "⚠️ Skipped existing series landing page: $seriesIndexNJKPath"
}

# .11tydata.js (metadata – keep current always; overwrite ok if you prefer)
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

# .11tydata.js (metadata + episode cards + nav)
$seriesIndexDataPath = Join-Path $SeriesRoot "index.11tydata.js"
$newEpisodeCard = @"
    {
      href: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/",
      title: "$Title",
      glyph: "$Glyph",
      tagline: "$LandingDescription",
      tier: "$Tier",
      state: "$State"
    }
"@

$newEpisodeNav = @"
    { title: "$Title", desc: "$LandingDescription", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/" }
"@

if (Test-Path $seriesIndexDataPath) {
  $existing = Get-Content $seriesIndexDataPath -Raw
  $needle = [regex]::Escape("/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/")
  if ($existing -notmatch $needle) {
    $updated = $existing -replace '(pillarGrid:\s*\[[\s\S]*?)(\n\s*\])', "`$1,`n$newEpisodeCard`$2"
    $updated = $updated -replace '(seriesNav:\s*\[[\s\S]*?)(\n\s*\])', "`$1,`n$newEpisodeNav`$2"
    Set-Content $seriesIndexDataPath $updated -Encoding UTF8
    Write-Host "✅ Appended episode + nav card to: $seriesIndexDataPath"
  } else {
    Write-Host "⚠️ Skipped duplicate episode/nav card in: $seriesIndexDataPath"
  }
} else {
  $seriesCards = @"
export default {
  introText: "$SeriesTitleDefault, Series $SeriesNo — choose an episode:",
  pillarGrid: [
$newEpisodeCard
  ],
  seriesNav: [
$newEpisodeNav
  ],
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
  Write-Utf8File $seriesIndexDataPath $seriesCards
}

# =========================
# Episode landing (episodeRoot)
# =========================

# index.njk (only if missing)
$episodeIndexPath = Join-Path $episodeRoot "index.njk"
if (-not (Test-Path $episodeIndexPath)) {
$episodeIndexNJK = @"
---
layout: base.njk
title: "$Title"
description: "$LandingDescription"
tier: $Tier

glyph: "$Glyph"

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
---

{% block head %}
  {% set socialImage = "/tgk-assets/images/share/$PillarSlug/$SeriesSlug/$Slug.jpg" %}
  {% include "partials/head-meta.njk" %}
  {% set items = pillarGrid %}
  {% set headline = "$Title — Series $SeriesNo" %}
  {% set base = "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/" %}
  {% include "partials/jsonld-collection.njk" %}
{% endblock %}

<main class="main-content">
<section class="content-container">

<h4 class="index heading">
  $Title — $LandingDescription
</h4>

<details class="disclaimer-box">
  <summary><span class="disclaimer-heading">$Glyph About $Title</span></summary>
  <p>
    <strong>$Title</strong> begins this episode’s journey into hidden teachings.
  </p>
</details>

{% include "partials/pillar-grid.njk" %}

<div class="gnostic-divider">
  <span class="divider-symbol pillar-glyph spin spin" aria-hidden="true">{{ pillarGlyph }}</span>
</div>

</main>
"@
  Write-Utf8File $episodeIndexPath $episodeIndexNJK
} else {
  Write-Host "⚠️ Skipped existing episode landing page: $episodeIndexPath"
}

# index.11tydata.js (parts) – append-or-create (NO overwrite afterwards)
$episodeIndexDataPath = Join-Path $episodeRoot "index.11tydata.js"

# ① Define part cards (for pillarGrid)
$newPartCards = @"
    { href: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-1/", title: "Part I — TBD", glyph: "$Glyph", tagline: "$Title, Part I tagline", tier: "$Tier", state: "$State" },
    { href: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-2/", title: "Part II — TBD", glyph: "$Glyph", tagline: "$Title, Part II tagline", tier: "$Tier", state: "$State" },
    { href: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-3/", title: "Part III — TBD", glyph: "$Glyph", tagline: "$Title, Part III tagline", tier: "$Tier", state: "$State" }
"@

# ② Generate a mirrored version for seriesNav (text-based nav)
# Strip extra fields from $newPartCards dynamically for cleaner links
$seriesNav = ($newPartCards -split "`n" | ForEach-Object {
    if ($_ -match 'href:\s*"([^"]+)"' -and $_ -match 'title:\s*"([^"]+)"') {
        $url = $matches[1]
        $title = $matches[2] -replace "— TBD",""
        "    { title: `"$title`", desc: `"$Title, navigation link`", url: `"$url`" },"
    }
}) -join "`n"

# ③ Write or append to file
if (Test-Path $episodeIndexDataPath) {
  $existing = Get-Content $episodeIndexDataPath -Raw
  $needle = [regex]::Escape("/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-1/")
  if ($existing -notmatch $needle) {
    $updated = $existing -replace '(pillarGrid:\s*\[[\s\S]*?)(\n\s*\])', "`$1,`n$newPartCards`$2"
    Set-Content $episodeIndexDataPath $updated -Encoding UTF8
    Write-Host "✅ Appended part cards to: $episodeIndexDataPath"
  } else {
    Write-Host "⚠️ Skipped duplicate part cards in: $episodeIndexDataPath"
  }
} else {
  $episodeIndexData = @"
export default {
  introText: "$Title — a three-part journey.",
  tagline: "$LandingDescription",
  seriesMeta: { number: $SeriesNo, label: "Series $SeriesNo", series_version: $SeriesVersion },
  episode: $Episode,
  disclaimerTitle: "⚠️ Diversity of Sources",
  disclaimerText: "<p>Interpretations vary across schools and texts in this pillar/series.</p>",

  pillarGrid: [
$newPartCards
  ]
};
"@
  Write-Utf8File $episodeIndexDataPath $episodeIndexData
  Write-Host "✅ Created new: $episodeIndexDataPath (includes pillarGrid + seriesNav)"
}

# =========================
# Scroll Parts + Quiz Files
# =========================
for ($i = 1; $i -le 3; $i++) {
  $roman = Roman $i
  $partDir = Join-Path $episodeRoot "part-$i"
  $permalink = "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-$i/index.html"
  $imgBase = "$mediaBase/part-$i"
  $partId = "part$i"
  $quizId = "$SeriesSlug-s$SeriesNo-$Slug-part$i"

  $partMd = @"
---
layout: base.njk
title: "$Title"
description: ""
tier: $Tier
episode: $Episode
partNumeral: $roman
partTitle: "Part $roman — TBD"
tagline: "Tagline for Part $roman"
slug: "part-$i"
permalink: "$permalink"
socialImage: "/tgk-assets/images/share/$PillarSlug/$SeriesSlug/$Slug-part-$i.jpg"
imgBase: "$imgBase"
imgPrefix: "$Slug-"
bodyClass: "$BodyClass"

glyph: "$Glyph"
pillar: "$PillarSlug"
series: "$SeriesSlug"

seriesId: "$seriesKey"
episodeId: "$Slug"
partId: "$partId"
quizId: "$quizId"
quizIntro: "Can you see through the veil of Part $roman?"
seriesMeta:
  number: $SeriesNo
  label: "Series $SeriesNo"
  series_version: $SeriesVersion

# 🔮 Section Visibility Controls
discussEnabled: true         # if false, hides "Discussion" tab + section
resourcesEnabled: true       # optional override for “Resources” tab
seriesNavEnabled: true       # optional override for “Series Map” tab
quizEnabled: true

lensEnabled: true
crossLinks: []
vaultRefs: []
communityThreads: []
relatedProducts: []

breadcrumbs:
  - { title: "The Gnostic Key", url: "/" }
  - { title: "$PillarNameDefault", url: "/pillars/$PillarSlug/" }
  - { title: "$SeriesTitleDefault", url: "/pillars/$PillarSlug/$SeriesSlug/" }
  - { title: "Series $(Roman $SeriesNo)", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/" }
  - { title: "$Title", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/" }
  - { title: "Part $roman" }

glossary:
  - term: "TBC"
    def: "TBC."
  - term: "TBC"
    def: "TBC."

references:
  title: "📚 Sources & Study Path"
  intro: "For those wishing to go deeper, these texts offer both insight and initiation into the tradition."
  readings:
    - title: "⚡ Title One"
      desc: "Short description of why it matters"
    - title: "⚡ Title Two"
      desc: "Short description of why it matters"
    - title: "⚡ Title Three"
      desc: "Short description of why it matters"
  scholarly:
    - author: "Lastname, F."
      work: "Book or Paper Title"
      year: 2000
      pub: "Publisher"
    - author: "Lastname, F."
      work: "Another Title"
      year: 2010
      pub: "Publisher"

---

{% include "partials/scroll-tabs.njk" %}

<main class="main-content">
<section class="content-container">

<details class="disclaimer-box">
  <summary>
    <span class="disclaimer-heading">⚠️ Previously in Part I/II/etc</span>
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

<blockquote class="blockquote">
  &ldquo;Your eyes shall be opened, and you shall be like gods, knowing good and evil.&rdquo;<br>
  <cite>
    <em>Genesis 3:5</em> (Gnostic lens), 
    <a href="https://firebasestorage.googleapis.com/v0/b/the-gnostic-key.firebasestorage.app/o/the-teachings%2Fgnostic-christianity%2Fgenesis-3.pdf?alt=media" target="_blank" rel="noopener noreferrer">Source</a>
  </cite>
</blockquote>

<!--Image block-->
<figure class="image-block">
  <picture>
    <source srcset="{{ imgBase }}/{{ imgPrefix }}eden-serpent-gnosis.webp" type="image/webp">
    <img src="{{ imgBase }}/{{ imgPrefix }}eden-serpent-gnosis.jpg" alt="Gnostic vision of the Eden awakening" class="image-gnostic" loading="lazy">
  </picture>
  <figcaption class="caption-gnostic">Caption.</figcaption>
</figure>

<!--🧘 Practicing Gnosis Today-->
<section class="section-block">
  <h2 class="section-heading">🧘 Chapter 17: Practicing Gnosis Today</h2>
  <p><strong>Gnosis isn’t philosophy. It’s practice.</strong></p>
  <p>Mirror meditation exercise here…</p>
</section>

<!-- 🎨 Creative Prompt -->
<section class="section-block">
  <h2 class="section-heading">🎨 Creative Prompt</h2>
  <p>Prompt instructions here…</p>
  {% include "partials/share-buttons.njk" %}
</section>

<!--Glossary-->
<section class="section-block" id="glossary">
  <h2 class="section-heading">📖 Glossary</h2>
  <dl class="glossary">
    <div class="glossary-entry">
      <dt>TBD</dt>
      <dd>TBD.</dd>
    </div>
  </dl>
</section>

<!--Quiz-->
{% include "partials/quiz-block.njk" %}

<!--Discussion Block-->
<section class="section-block" id="discuss">
  <h2 class="section-heading">🗣️ Discussion Prompt:</h2>
  <p>TBD</p>
  {% include "partials/share-buttons.njk" %}
</section>

<!-- 📚 Gnostic Sources & Study Path -->
{% include "partials/reference-section.njk" %}

<!--Episode Parts-->
<section class="section-block" id="series">
  <h2 class="section-heading">📜 Series Map</h2>
  {% include "partials/series-nav-buttons.njk" %}
</section>

<!--∞ Synergist Lens-->
{% include "partials/synergist-lens.njk" %}

<!-- 🔑 CTA Buttons (only for free tier) -->
{% if tier == "free" %}
<section class="section-block" id="cta">
  <h2 class="section-heading">🔑 Unlock More Scrolls</h2>
  <p>Enjoying this scroll? Subscribe for full access or support the project directly.</p>
  {% include "partials/cta-buttons.njk" %}
</section>
{% endif %}

<!-- Episode Part Nav -->
{% include "partials/episode-part-nav.njk" %}

<div class="gnostic-divider">
  <span class="divider-symbol pillar-glyph spin spin" aria-hidden="true">{{ pillarGlyph }}</span>
</div>

</section>
</main>
"@

  $partPath = Join-Path $partDir "index.md"
  if (-not (Test-Path $partPath)) {
    Write-Utf8File $partPath $partMd
  }

  if ($WithQuizzes) {
    $quizDir = Join-Path $Root "src/_data/quiz/$PillarSlug/$SeriesSlug/series-$SeriesNo"
    [System.IO.Directory]::CreateDirectory($quizDir) | Out-Null
    $quizPath = Join-Path $quizDir "$quizId.js"
    if (-not (Test-Path $quizPath)) {
      $quizJs = @"
export default {
  meta: {
    seriesId: "$seriesKey",
    episodeId: "$Slug",
    partId: "part$i",
    quizId: "$quizId"
  },
  intro: "$(
    (Get-Content (Join-Path $partDir 'index.md') -Raw |
    Select-String '^\s*quizIntro:\s*["'']?(.*?)["'']?\s*$' |
    ForEach-Object { $_.Matches[0].Groups[1].Value.Trim() }
    )
  )",
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
    } else {
      Write-Host "⚠️ Skipped existing quiz file: $quizPath"
    }
  }
}

Write-Host "✅ Created/updated episode at: $episodeRoot"

$quizIndexPath = Join-Path $Root "src/_data/quiz/index.js"

# Step 1: read current file (or create new if missing)
if (Test-Path $quizIndexPath) {
  $lines = Get-Content $quizIndexPath
} else {
  $lines = @("import placeholder from './placeholder.js';", "", "export default {", "};")
}

# Step 2: build new imports + map lines
$newImports = @()
$newMaps    = @()
for ($i=1; $i -le 3; $i++) {
  $alias = "${Slug.Replace('-','')}Part$i"
  $rel   = "./$PillarSlug/$SeriesSlug/series-$SeriesNo/the-afterlife-s$SeriesNo-$Slug-part$i.js"
  $newImports += "import $alias from '$rel';"
  $newMaps    += "  [$alias.meta.quizId]: $alias,"
}

# Step 3: collect existing imports/maps
$existingImports = $lines | Where-Object { $_ -like 'import*' }
$existingMaps    = $lines | Where-Object { $_ -match '\[.*meta.quizId\]' }

# Step 4: merge + dedupe + sort
$allImports = ($existingImports + $newImports | Sort-Object | Get-Unique)
$allMaps    = ($existingMaps + $newMaps | Sort-Object | Get-Unique)

# Step 5: rebuild file
$rebuild = @()
$rebuild += $allImports
$rebuild += ""
$rebuild += "export default {"
$rebuild += $allMaps
$rebuild += "};"

Set-Content $quizIndexPath $rebuild -Encoding UTF8
Write-Host "✅ Quiz index updated and alphabetised."

# =========================
# Episode-specific .11tydata.js (slug-level)
# =========================
$episodeDotDataPath = Join-Path $episodeRoot "$Slug.11tydata.js"

# Build seriesNav dynamically from the series-level index.11tydata.js
$seriesIndexDataPath = Join-Path $SeriesRoot "index.11tydata.js"
if (Test-Path $seriesIndexDataPath) {
  $seriesContent = Get-Content $seriesIndexDataPath -Raw

  # Match whole object blocks inside pillarGrid or seriesNav
  $episodeBlocks = [regex]::Matches($seriesContent, '\{[^}]*\}') | ForEach-Object { $_.Value }

  $seriesNav = foreach ($block in $episodeBlocks) {
    $url   = if ($block -match 'href:\s*"([^"]+)"') { $matches[1] } else { "" }
    $title = if ($block -match 'title:\s*"([^"]+)"') { $matches[1] } else { "" }
    $desc  = if ($block -match 'tagline:\s*"([^"]+)"') { $matches[1] } else { "" }

    if ($url -and $title) {
      "    { title: `"$title`", desc: `"$desc`", url: `"$url`" },"
    }
  } -join "`n"

} else {
  Write-Host "⚠️ Could not build seriesNav (series index missing: $seriesIndexDataPath)"
  $seriesNav = ""
}

if (-not (Test-Path $episodeDotDataPath)) {
$episodeDotData = @"
export default {
  seriesLabel: "The Afterlife Series",
  pillarLabel: "$PillarNameDefault",
  glyphRow: ["$Glyph", "☥", "$Glyph"],
  seriesHome: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/",
  pillarHome: "/pillars/$PillarSlug/",
  episode: $Episode,
  tagline: "$LandingDescription",
  seriesMeta: { number: $SeriesNo, label: "Series $SeriesNo", series_version: $SeriesVersion },
  episodeParts: [
    { title: "Part I", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-1/" },
    { title: "Part II", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-2/" },
    { title: "Part III", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug/part-3/" }
  ],
  seriesNav: [
$seriesNav
  ],
  layout: "base.njk",
  pillar: "$PillarSlug",
  series: "$SeriesSlug",
  eleventyComputed: {
    slug: (d) => d.slug || d.page.fileSlug,
    permalink: (d) => d.permalink || d.page.url,
    imgBase: (d) => d.imgBase || "$mediaBase",
    imgPrefix: (d) => d.imgPrefix || "$Slug-",
    socialImage: (d) => d.socialImage || "$socialImage",
    breadcrumbsBase: () => [
      { title: "The Gnostic Key", url: "/" },
      { title: "$PillarNameDefault", url: "/pillars/$PillarSlug/" },
      { title: "$SeriesTitleDefault", url: "/pillars/$PillarSlug/$SeriesSlug/" },
      { title: "Series $SeriesNo", url: "/pillars/$PillarSlug/$SeriesSlug/series-$SeriesNo/" }
    ],
    breadcrumbs: (d) => [...(d.breadcrumbsBase || []), d.title ? { title: d.title } : null].filter(Boolean)
  }
};
"@
  Write-Utf8File $episodeDotDataPath $episodeDotData
  Write-Host "✅ Created episode data file: $episodeDotDataPath"
} else {
  Write-Host "⚠️ Skipped existing episode data file: $episodeDotDataPath"
}

# =========================
# Sync seriesNav into every episode's .11tydata.js
# =========================
$seriesIndexDataPath = Join-Path $SeriesRoot "index.11tydata.js"
if (Test-Path $seriesIndexDataPath) {
  $seriesContent = Get-Content $seriesIndexDataPath -Raw

  # extract all episodes from pillarGrid
  $episodeBlocks = [regex]::Matches($seriesContent, '\{[^}]*\}') | ForEach-Object { $_.Value }

  $seriesNav = foreach ($block in $episodeBlocks) {
    $url   = if ($block -match 'href:\s*"([^"]+)"') { $matches[1] } else { "" }
    $title = if ($block -match 'title:\s*"([^"]+)"') { $matches[1] } else { "" }
    $desc  = if ($block -match 'tagline:\s*"([^"]+)"') { $matches[1] } else { "" }
    if ($url -and $title) {
      "    { title: `"$title`", desc: `"$desc`", url: `"$url`" },"
    }
  } -join "`n"

  # now push that into EVERY episode’s .11tydata.js under the series
  $episodeDirs = Get-ChildItem $SeriesRoot -Directory
  foreach ($ep in $episodeDirs) {
    $epDataFile = Join-Path $ep.FullName "$($ep.Name).11tydata.js"
    if (Test-Path $epDataFile) {
      $content = Get-Content $epDataFile -Raw
      if ($content -match 'seriesNav:\s*\[') {
        $newContent = $content -replace '(seriesNav:\s*\[[\s\S]*?\])',
          "seriesNav: [`n$seriesNav`n  ]"
        Set-Content $epDataFile $newContent -Encoding UTF8
        Write-Host "🔄 Synced seriesNav in: $epDataFile"
      }
    }
  }
} else {
  Write-Host "⚠️ Series index missing, cannot sync seriesNav."
}

# =========================
# Social Image Placeholders
# =========================
$shareDir = Join-Path $Root "src/media/tgk-assets/images/share/$PillarSlug/$SeriesSlug"
[System.IO.Directory]::CreateDirectory($shareDir) | Out-Null
$shareFile = Join-Path $shareDir "$Slug.jpg"
if (-not (Test-Path $shareFile)) {
  $pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
  $pngBytes  = [Convert]::FromBase64String($pngBase64)
  [IO.File]::WriteAllBytes($shareFile, $pngBytes)
} else {
  Write-Host "⚠️ Skipped existing share image: $shareFile"
}

# =========================
# Media Folders (src + tgk-assets mirror + placeholders)
# =========================
$mediaRootSrc   = Join-Path $Root "src/media/$PillarSlug/$SeriesSlug/series-$SeriesNo/$Slug"
$mediaRootShare = Join-Path $Root "src/media/tgk-assets/$PillarSlug/$SeriesSlug/$Slug"

$pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
$pngBytes  = [Convert]::FromBase64String($pngBase64)

foreach ($dir in @($mediaRootSrc, $mediaRootShare)) {
  foreach ($i in 1..3) {
    $target = Join-Path $dir "part-$i"
    [System.IO.Directory]::CreateDirectory($target) | Out-Null

    $jpgPath = Join-Path $target "placeholder.jpg"
    $webpPath = Join-Path $target "placeholder.webp"

    if (-not (Test-Path $jpgPath)) { [IO.File]::WriteAllBytes($jpgPath, $pngBytes) }
    if (-not (Test-Path $webpPath)) { [IO.File]::WriteAllBytes($webpPath, $pngBytes) }
  }
}

Write-Host "📂 Media + placeholder images prepared:"
Write-Host "   - $mediaRootSrc"
Write-Host "   - $mediaRootShare"
