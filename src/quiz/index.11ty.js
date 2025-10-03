// src/quiz/index.11ty.js

import quizzes from "../_data/quiz/index.js";  // ✅ correct relative path

export default class {
  data() {
    return {
      permalink: "quiz/index.json", // served at /quiz/index.json
      eleventyExcludeFromCollections: true
    };
  }

  render() {
    return JSON.stringify(quizzes, null, 2);
  }
}
