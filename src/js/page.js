import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// === 🔑 Firebase Config ===
const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_API_KEY,
  authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.FIREBASE_APP_ID,
};

// === 🜂 Init ===
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// === 🧙 page Signup ===
async function pageSignup(email, password) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const token = await userCred.user.getIdToken();
  
  // link Firebase user to Stripe customer
  await fetch("/.netlify/functions/create-stripe-customer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token }),
  });
  
  alert("Welcome to The Gnostic Key ✦ Account created.");
  window.location.href = "/dashboard/";
}

// === 🜂 Sign In ===
async function pageSignin(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
  window.location.href = "/dashboard/";
}

// === 🜂 Password Reset ===
function pageReset(email) {
  sendPasswordResetEmail(auth, email)
    .then(() => alert("Reset link sent to your email."))
    .catch((e) => alert("Error: " + e.message));
}

// === 🜂 Logout ===
function pageLogout() {
  signOut(auth).then(() => window.location.href = "/");
}

// === 🜂 Watch Auth State ===
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("user-name")?.textContent = user.email.split("@")[0];
  } else {
    // redirect if on protected page
    if (document.body.classList.contains("requires-auth")) {
      window.location.href = "/signin/";
    }
  }
});

export { pageSignup, pageSignin, pageReset, pageLogout };
