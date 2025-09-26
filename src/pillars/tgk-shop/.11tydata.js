export default {
  eleventyComputed: {
    pillarId: () => "tgk-shop",
    pillarName: () => "TGK Shop",
    pillarUrl: () => "/pillars/tgk-shop/",
    pillarGlyph: () => "🛍️",
    accent: () => "shop",
    breadcrumbs: () => ([
      { title: "The Gnostic Key", url: "/" },
      { title: "TGK Shop", url: "/pillars/tgk-shop/" }
    ])
  }
};
