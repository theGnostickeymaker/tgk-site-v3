// 🜂 TGK — Global Site Defaults and Metadata
export default {
  // === Global Defaults ===
  defaultTier: "free",
  layoutDefaultTemplate: "base.njk",

  // === Core Branding ===
  siteTitle: "The Gnostic Key",
  siteShortTitle: "TGK",
  siteDescription:
    "A sovereign library of symbolic knowledge, spiritual memory and cultural rebellion.",
  siteUrl: "https://thegnostickey.com",

  // === SEO Defaults ===
  seo: {
    // ---- Canonical & Search ----
    canonicalBase: "https://thegnostickey.com",
    defaultImage: "/tgk-assets/images/share/default-share.jpg",

    // ---- Open Graph ----
    og: {
      type: "website",
      locale: "en_GB",
      siteName: "The Gnostic Key",
      defaultImage: "/tgk-assets/images/share/default-share.jpg"
    },

    // ---- Twitter / X ----
    twitter: {
      card: "summary_large_image",
      site: "@thegnostickey",
      creator: "@thegnostickey",
      defaultImage: "/tgk-assets/images/share/default-share.jpg"
    },

    // ---- Facebook / Instagram ----
    facebook: {
      appId: "",
      publisher: "https://facebook.com/thegnostickey"
    },

    // ---- Pinterest ----
    pinterest: {
      domainVerify: ""
    },

    // ---- Substack ----
    substack: {
      publication: "https://thegnostickey.substack.com"
    },

    // ---- Telegram ----
    telegram: {
      channel: "https://t.me/thegnostickey"
    },

    // ---- Structured Data Defaults ----
    schema: {
      organisation: {
        "@type": "Organization",
        "name": "The Gnostic Key",
        "url": "https://thegnostickey.com",
        "logo": "/tgk-assets/images/logo/tgk-logo.png",
        "sameAs": [
          "https://facebook.com/thegnostickey",
          "https://instagram.com/thegnostickey",
          "https://tiktok.com/@thegnostickey",
          "https://twitter.com/thegnostickey",
          "https://youtube.com/@thegnostickey",
          "https://t.me/thegnostickey",
          "https://thegnostickey.substack.com"
        ]
      }
    }
  },

  // === Global Hierarchy Labels (fallbacks) ===
  labels: {
    pillar: "Pillar",
    gate: "Gate",
    series: "Series",
    season: "Season",
    episode: "Episode",
    part: "Part"
  }
};
