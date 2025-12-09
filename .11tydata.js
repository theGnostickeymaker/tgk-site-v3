export default {
  eleventyComputed: {
    layout: (data) => {
      // If a layout is defined AND is not empty, keep it
      if (typeof data.layout === "string" && data.layout.trim() !== "") {
        return data.layout;
      }

      return "base.njk";
    }
  }
};
