/* ===========================================================
   🔥 TGK — Firebase Init (v2.0)
   Shared initialization for Auth, Firestore & Functions
   =========================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";

// Firebase Initialisation (TGK v3)

// These values are injected by Eleventy at build time via environment variables
const firebaseConfig = {
  apiKey: "{{ env.FIREBASE_API_KEY }}",
  authDomain: "{{ env.FIREBASE_AUTH_DOMAIN }}",
  projectId: "{{ env.FIREBASE_PROJECT_ID }}",
  storageBucket: "{{ env.FIREBASE_STORAGE_BUCKET }}",
  messagingSenderId: "{{ env.FIREBASE_MESSAGING_SENDER_ID }}",
  appId: "{{ env.FIREBASE_APP_ID }}"
};

// Initialise Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
export const firebaseApp = initializeApp(firebaseConfig);


// Export shared app instance
export const app = initializeApp(firebaseConfig);
console.log("[Firebase] App initialized.");
