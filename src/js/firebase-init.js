/* ===========================================================
   TGK — Firebase Init (Browser ESM Safe)
   FIXED: Exports auth + db so Firestore writes work
   =========================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-analytics.js";

// Live public Firebase config (safe to expose)
const firebaseConfig = {
  apiKey: "AIzaSyDYrFIw9I3hManf1TqvP6FARZTC-MlMuz0",
  authDomain: "the-gnostic-key.firebaseapp.com",
  projectId: "the-gnostic-key",
  storageBucket: "the-gnostic-key.firebasestorage.app",
  messagingSenderId: "903609435224",
  appId: "1:903609435224:web:3031fc94c9fbbe78f8762d",
  measurementId: "G-KD96SXX3JY"
};

// Initialise app
export const app = initializeApp(firebaseConfig);

// Initialise Auth
export const auth = getAuth(app);

// Initialise Firestore
export const db = getFirestore(app);

// Analytics (optional)
try {
  getAnalytics(app);
} catch (err) {
  console.warn("Analytics disabled:", err.message);
}

console.log("[Firebase] App initialised (auth + db ready).");
