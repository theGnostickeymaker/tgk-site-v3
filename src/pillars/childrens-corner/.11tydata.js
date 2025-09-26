export default {
  eleventyComputed: {
    pillarId: () => "childrens-corner",
    pillarName: () => "Children’s Corner",
    pillarUrl: () => "/pillars/childrens-corner/",
    pillarGlyph: () => "🧸",
    accent: () => "children",
    breadcrumbs: () => ([
      { title: "The Gnostic Key", url: "/" },
      { title: "Children’s Corner", url: "/pillars/childrens-corner/" }
    ])
  }
};
