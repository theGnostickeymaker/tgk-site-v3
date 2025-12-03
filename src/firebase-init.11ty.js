export const data = {
  permalink: "/js/firebase-init.js",
  eleventyExcludeFromCollections: true,
};

export function render() {
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY ?? "",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.FIREBASE_APP_ID ?? "",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID ?? "",
  };

  const requiredKeys = [
    "FIREBASE_API_KEY",
    "FIREBASE_AUTH_DOMAIN",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_STORAGE_BUCKET",
    "FIREBASE_MESSAGING_SENDER_ID",
    "FIREBASE_APP_ID",
  ];

  const missingEnv = requiredKeys.filter(key => !(process.env[key] ?? "").trim());
  const warningBlock = missingEnv.length
    ? `console.warn("[Firebase] Missing env vars: ${missingEnv.join(", ")}. Add them to your .env file or hosting dashboard so /js/firebase-init.js builds with real keys.");`
    : "";

  const configJson = JSON.stringify(firebaseConfig, null, 2);

  return `/* ===========================================================
   🔥 TGK — Firebase Init (v2.1)
   Shared initialization for Auth, Firestore & Functions
   =========================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";

export const firebaseConfig = ${configJson};
${warningBlock}
export const app = initializeApp(firebaseConfig);
console.log("[Firebase] App initialized.");
`;
}