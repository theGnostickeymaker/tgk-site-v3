export default {
  eleventyComputed: {
    layout: (data) => {
      // If a page explicitly sets a layout, do NOT override
      if (data.layout) {
        return data.layout;
      }

      // Otherwise fall back to base
      return "base.njk";
    }
  }
};
