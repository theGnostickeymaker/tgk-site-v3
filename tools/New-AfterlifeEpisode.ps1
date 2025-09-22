param(
  [Parameter(Mandatory)] [int]    $SeriesNo,          # e.g. 1
  [Parameter(Mandatory)] [string] $Slug,              # e.g. gnostic-christianity
  [Parameter(Mandatory)] [string] $Title,             # e.g. "Gnostic Christianity"
  [Parameter(Mandatory)] [int]    $Episode,           # e.g. 1
  [ValidateSet('free','initiate','full')]
  [string] $Tier = 'free',
  [string] $Glyph = '⛪︎',
  [string] $BodyClass = 'gold',
  [string] $Root = '.',
  [switch] $WithQuizzes,

  # landing page extras
  [int]    $SeriesVersion = 1,
  [string] $LandingDescription = "Three-part journey: the false cosmos, Christ the Revealer, and the soul’s return.",
  [string] $SocialImage = ""   # optional override; default computed below
)

# Resolve Root relative to the script location if left as '.'
if ($Root -eq '.' -or [string]::IsNullOrWhiteSpace($Root)) {
  $Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
}

function Write-Utf8File($Path, $Content) {
  $parent = Split-Path -Path $Path -Parent
  [System.IO.Directory]::CreateDirectory($parent) | Out-Null  # creates all intermediate dirs
  $utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBOM)
}

function Roman([int]$n){
  $map = @{1='I';2='II';3='III';4='IV';5='V';6='VI';7='VII';8='VIII';9='IX';10='X'}
  return $map[$n]
}

$EpisodeDir = Join-Path $Root ("src/pillars/the-teachings/the-afterlife/series-{0}/{1}" -f $SeriesNo,$Slug)
$MediaBase  = "/media/afterlife/series-$SeriesNo/$Slug"
if (-not $SocialImage -or $SocialImage -eq "") { $SocialImage = "/TGK-assets/images/share/the-teachings/$Slug.jpg" }

# ---------------- episode 11tydata.js ----------------
$episodeData = @"
export default {
  seriesLabel: "Afterlife Series",
  pillarLabel: "The Teachings",
  glyphRow: ["$Glyph","𓂀","$Glyph"],

  seriesHome: "/pillars/the-teachings/the-afterlife/series-$SeriesNo/$Slug/",
  pillarHome: "/pillars/the-teachings/",

  episodeParts: [
    { title: "Part I", desc: "", url: "/pillars/the-teachings/the-afterlife/series-$SeriesNo/$Slug/part-1/" },
    { title: "Part II", desc: "", url: "/pillars/the-teachings/the-afterlife/series-$SeriesNo/$Slug/part-2/" },
    { title: "Part III", desc: "", url: "/pillars/the-teachings/the-afterlife/series-$SeriesNo/$Slug/part-3/" }
  ],

  layout: "base.njk",
  pillar: "the-teachings",
  series: "the-afterlife",
  seriesMeta: { number: $SeriesNo, label: "Series $SeriesNo", series_version: $SeriesVersion },

  eleventyComputed: {
    slug: (data) => data.slug || data.page.fileSlug,
    permalink: (data) => data.permalink || data.page.url,
    imgBase: (data) => data.imgBase || "$MediaBase",
    imgPrefix: (data) => data.imgPrefix || "$Slug-",
    socialImage: (data) => data.socialImage || "/pillars/the-teachings/the-afterlife/og/$Slug.jpg",
    breadcrumbsBase: (data) => [
      { title: "The Gnostic Key", url: "/" },
      { title: "The Teachings", url: "/pillars/the-teachings/" },
      { title: "The Afterlife", url: "/pillars/the-teachings/the-afterlife/" },
      { title: "Series $SeriesNo", url: "/pillars/the-teachings/the-afterlife/series-$SeriesNo/" },
      { title: "$Title", url: "/pillars/the-teachings/the-afterlife/series-$SeriesNo/$Slug/" }
    ],
    breadcrumbs: (data) => [
      ...(data.breadcrumbsBase || []),
      data.title ? { title: data.title } : null
    ].filter(Boolean)
  }
}
"@
Write-Utf8File (Join-Path $EpisodeDir "$Slug.11tydata.js") $episodeData

# ---------------- index.11tydata.js (landing data) ----------------
$landingData = @"
export default {
  introText: \`$LandingDescription\`,
  disclaimerTitle: "Diversity of Sources",
  disclaimerText: \`
    <p>This scroll draws from multiple Gnostic sources. Interpretations vary across schools.</p>
  \`,
  pillarGrid: [
    { href: "/pillars/the-teachings/the-afterlife/series-$SeriesNo/$Slug/part-1/", title: "Part I",  glyph: "$Glyph", tagline: "Part I tagline",  status: "$Tier" },
    { href: "/pillars/the-teachings/the-afterlife/series-$SeriesNo/$Slug/part-2/", title: "Part II", glyph: "$Glyph", tagline: "Part II tagline", status: "$Tier" },
    { href: "/pillars/the-teachings/the-afterlife/series-$SeriesNo/$Slug/part-3/", title: "Part III",glyph: "$Glyph", tagline: "Part III tagline",status: "$Tier" }
  ]
}
"@
Write-Utf8File (Join-Path $EpisodeDir "index.11tydata.js") $landingData

# ---------------- index.njk (landing page) ----------------
$indexNjk = @"
---
layout: base.njk
title: "$Title"
scrollGroup: "$Title"
seriesGroup: "The Afterlife Series"
description: "$LandingDescription"
tier: $Tier
series_version: $SeriesVersion
permalink: "/pillars/the-teachings/the-afterlife/series-$SeriesNo/$Slug/index.html"
---

{% block head %}
  {% set socialImage = "$SocialImage" %}
  {% include "partials/head-meta.njk" %}

  {# Optional JSON-LD for scroll-level navigation #}
  {% set items = collections.content
      | bySeries("the-afterlife")
      | bySeriesVersion($SeriesVersion)
      | sortByEpisode %}
  {% set headline = "$Title — Afterlife Series $SeriesNo" %}
  {% set base = "/pillars/the-teachings/the-afterlife/series-$SeriesNo/$Slug/" %}
  {% include "partials/jsonld-collection.njk" %}
{% endblock %}

<main class="main-content">
  {% include "partials/index-header.njk" %}
  {% include "partials/pillar-grid.njk" %}
  <div class="gnostic-divider">
    <span class="divider-symbol pillar-glyph spin glow" aria-hidden="true">$Glyph</span>
  </div>
</main>
"@
Write-Utf8File (Join-Path $EpisodeDir "index.njk") $indexNjk

# ---------------- part pages (part-1..3) ----------------
for($i=1; $i -le 3; $i++){
  $roman  = Roman $i
  $partDir = Join-Path $EpisodeDir ("part-{0}" -f $i)
  $permalink = "/pillars/the-teachings/the-afterlife/series-$SeriesNo/$Slug/part-$i/index.html"
  $social    = "/media/share/the-teachings/the-afterlife/$Slug-part-$i.jpg"
  $imgBase   = "$MediaBase/part-$i"
  $imgPrefix = "$Slug-"
  $partId    = "part$i"
  $quizId    = "afterlife-s$SeriesNo-$Slug-part$i"

  $partMd = @"
---
layout: base.njk
title: "$Title"
description: ""
tier: $Tier
episode: $Episode
partNumeral: $roman
partTitle: Part $roman

slug: "part-$i"
permalink: "$permalink"
socialImage: "$social"
imgBase: "$imgBase"
imgPrefix: "$imgPrefix"
bodyClass: "$BodyClass"
glyph: "$Glyph"

seriesId: "afterlife-s$SeriesNo"
episodeId: "$Slug"
partId: "$partId"
quizId: "$quizId"
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
  <summary><span class="disclaimer-heading">Reading Note</span></summary>
  <p>Symbolic, initiatory material. Read slowly; cross-check sources.</p>
</details>

<section class="section-block">
  <h2 class="section-heading">## Heading</h2>
  <p>Start writing Part $i here…</p>
</section>

<figure class="image-block">
  <picture>
    <source srcset="{{ imgBase }}/{{ imgPrefix }}image-$i-01.webp" type="image/webp">
    <img src="{{ imgBase }}/{{ imgPrefix }}image-$i-01.jpg" alt="Describe the image" class="image-gnostic" loading="lazy">
  </picture>
  <figcaption class="caption-gnostic">Optional caption.</figcaption>
</figure>

<section class="section-block">
  <h2 class="section-heading">⚡ TL;DR</h2>
  <ul class="list-emoji">
    <li>Key idea 1</li>
    <li>Key idea 2</li>
    <li>Key idea 3</li>
  </ul>
</section>

<section class="section-block" id="quiz">
  <h2 class="section-heading">Quiz</h2>
  <div id="quiz-container" data-quiz-id="{{ quizId }}"></div>
  {% include "partials/quiz-data-loader.njk" %}
</section>

<section class="section-block" id="glossary">
  <h2 class="section-heading">Glossary</h2>
  <dl class="glossary">
    <div class="glossary-entry"><dt>Term</dt><dd>Definition.</dd></div>
  </dl>
</section>

<section class="section-block" id="discuss">
  <h2 class="section-heading">Discussion</h2>
  <p>Prompt goes here.</p>
</section>

<section class="section-block" id="series">
  <h2 class="section-heading">Afterlife Maps from Other Traditions</h2>
  {% include "partials/series-links-nav.njk" %}
  {% include "partials/series-return-buttons.njk" %}
</section>

<section class="section-block">
  <h3 class="section-heading">Episode Parts</h3>
  {% include "partials/episode-scroll-nav.njk" %}
</section>

{% include "partials/series-nav-buttons.njk" %}

<div class="gnostic-divider">
  <span class="divider-symbol pillar-glyph spin" aria-hidden="true">$Glyph</span>
</div>

</section>
</main>
"@
  Write-Utf8File (Join-Path $partDir "index.md") $partMd
}

# ---------------- quiz data (optional) ----------------
if ($WithQuizzes) {
  $quizDir = Join-Path $Root "src/_data/quiz"
  New-Item -ItemType Directory -Force -Path $quizDir | Out-Null

  for($i=1; $i -le 3; $i++){
    $quizId = "afterlife-s$SeriesNo-$Slug-part$i"
    $quizPath = Join-Path $quizDir "$quizId.js"

$quizJs = @"
export default {
  meta: {
    seriesId: "afterlife-s$SeriesNo",
    episodeId: "$Slug",
    partId: "part$i",
    quizId: "$quizId"
  },
  intro: "Quick check: can you see through the first veil?",
  questions: [
    {
      id: "q1",
      prompt: "What is the Pleroma in Gnostic cosmology?",
      options: [
        { key: "A", label: "The underworld of souls" },
        { key: "B", label: "The realm of divine fullness beyond material reality" },
        { key: "C", label: "The name of the Archons’ kingdom" },
        { key: "D", label: "The Garden of Eden" }
      ],
      answer: "B",
      explanation: "Pleroma = Fullness; the true Source beyond illusion, fragmentation, or form."
    },
    {
      id: "q2",
      prompt: "Who or what is Yaldabaoth?",
      options: [
        { key: "A", label: "The true creator god" },
        { key: "B", label: "A fallen angel banished from heaven" },
        { key: "C", label: "A blind and arrogant Demiurge who thinks he is God" },
        { key: "D", label: "The brother of Jesus in Gnostic myth" }
      ],
      answer: "C",
      explanation: "Yaldabaoth is the false god—a blind creator who rules the material world without knowledge of the true Source."
    },
    {
      id: "q3",
      prompt: "What did the serpent represent in Gnostic readings of the Eden story?",
      options: [
        { key: "A", label: "The devil who tricked humanity" },
        { key: "B", label: "A chaotic force of destruction" },
        { key: "C", label: "An agent of Sophia offering liberation through knowledge" },
        { key: "D", label: "One of the Archons enforcing the Demiurge’s will" }
      ],
      answer: "C",
      explanation: "In Gnostic myth, the serpent is a liberator—a divine messenger of Sophia urging the soul to awaken through gnosis."
    },
    {
      id: "q4",
      prompt: "What is the divine spark?",
      options: [
        { key: "A", label: "The conscience given by religious teachings" },
        { key: "B", label: "A gift from the Archons to control human thought" },
        { key: "C", label: "The soul’s connection to its animal instincts" },
        { key: "D", label: "A fragment of the true divine Source buried within each human" }
      ],
      answer: "D",
      explanation: "The divine spark is a hidden fragment of the Pleroma—a trace of Sophia’s light encoded in the soul."
    }
  ]
};
"@
    Write-Utf8File $quizPath $quizJs
  }

  Write-Host "→ Quiz files created in: $quizDir"
}

Write-Host "✅ Created Afterlife episode:"
Write-Host "   $EpisodeDir"
Write-Host "→ index.njk, index.11tydata.js, episode .11tydata.js, parts, and optional quizzes."
