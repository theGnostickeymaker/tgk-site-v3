/* ===========================================================
   🔥 TGK — Firebase Init (Shared Singleton)
   =========================================================== */

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyDYrFIw9I3hManf1TqvP6FARZTC-MlMuz0",
  authDomain: "the-gnostic-key.firebaseapp.com",
  projectId: "the-gnostic-key",
  storageBucket: "the-gnostic-key.appspot.com",
  messagingSenderId: "903609435224",
  appId: "1:903609435224:web:3031fc94c9fbbe78f8762d",
  measurementId: "G-KD96SXX3JY"
};

// ✅ Prevent duplicate initialization
export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
