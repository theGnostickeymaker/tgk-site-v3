// src/pillars/.11tydata.js
const slugMap = {
  'the-teachings': 'tgk-teachings',
  'the-obsidian-key': 'tgk-obsidian-key',
  'the-gnostic-eye': 'tgk-gnostic-eye',
  'the-vault': 'tgk-vault',
  'the-keymakers-dream': 'tgk-keymakers-dream',
  'the-resonant-key': 'tgk-resonant-key',
  'tgk-shop': 'tgk-shop',
  'tgk-community': 'tgk-community',
  'childrens-corner': 'childrens-corner'
};

export default {
  eleventyComputed: {
    permalink: (data) => {
      const stem = data.page.filePathStem; // e.g. /src/pillars/the-teachings/the-afterlife/gnostic-christianity
      const parts = stem.split('/').filter(Boolean);
      const idx = parts.indexOf('pillars');
      if (idx === -1) return data.permalink ?? `${stem}/index.html`;

      // swap pillar folder to public tgk-* slug
      const segs = parts.slice(idx + 1); // ['the-teachings', 'the-afterlife', '...']
      segs[0] = slugMap[segs[0]] || segs[0];
      const rel = `/${segs.join('/')}/index.html`;

      const tier = (data.tier || 'free').toLowerCase(); // free|initiate|full
      return tier === 'free' ? rel : `/gated/${tier}${rel}`;
    },

    // ensure header.episodeTitle falls back to page.title
    header: (data) => ({
      ...(data.header || {}),
      episodeTitle: (data.header && data.header.episodeTitle) || data.title
    })
  }
};
