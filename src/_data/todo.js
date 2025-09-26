// ESM data file (because package.json has "type": "module")
export default {
  "lastUpdated": "2025-09-25",
  "categories": {
    "siteFunctionality": [
      "Fix dropdown accent/theme sync",
      "Restore working 11ty dev server",
      "Ensure accent tokens load correctly",
      "Check admin board persistence (localStorage)",
      "Verify inventory filters and search"
    ],
    "designTheme": [
      "Unify admin UI with TGK section-block + section-header styles",
      "Improve dark mode text readability",
      "Polish buttons (match TGK hover + active states)",
      "Align cards with section-block visuals"
    ],
    "contentGating": [
      "Add gating preview to admin inventory",
      "Highlight missing metadata (title, tier, series, episode, glyph)",
      "Export inventory JSON snapshot",
      "Test visibility-gates.css with real pages"
    ],
    "mediaOrganisation": [
      "Standardise /src/media/ structure (per pillar + per series)",
      "Create mirrored /tgk-assets/ folder in build output",
      "Update template generator to auto-create media subfolders",
      "Define naming convention for images (pillar-series-episode-xx.ext)",
      "Audit existing media files and re-sort into new structure"
    ],
    "testingPolish": [
      "Verify accent CSS loads only once per page",
      "Check FOUC prevention script works across browsers",
      "Audit footer/header opacity tokens",
      "Cleanup old/unused CSS files"
    ]
  }
}

