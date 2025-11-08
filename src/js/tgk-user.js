/* ===========================================================
   TGK — User UI (Dashboard, Profile, Logout)
   =========================================================== */

import { app } from "./firebase-init.js";
import { getAuth, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

export async function loadDashboardHeader(user) {
  const nameEl = document.getElementById("user-name");
  const tierEl = document.getElementById("user-tier");
  if (!nameEl || !tierEl) return;

  try {
    const userSnap = await getDoc(doc(db, "users", user.uid));
    const entSnap = await getDoc(doc(db, "entitlements", user.uid));

    const displayName = userSnap.exists() && userSnap.data().displayName
      ? userSnap.data().displayName
      : user.email.split("@")[0];

    const tier = entSnap.exists() ? (entSnap.data().tier || "free") : "free";

    nameEl.textContent = displayName;
    tierEl.textContent = tier.charAt(0).toUpperCase() + tier.slice(1);
    localStorage.setItem("tgk-tier", tier);
  } catch (err) {
    console.error("[User] Header load error:", err);
    tierEl.textContent = "Error";
  }
}

export async function loadUserProfile(user) {
  const nameInput = document.getElementById("profile-name");
  const emailInput = document.getElementById("profile-email");
  if (!nameInput || !emailInput) return;

  emailInput.value = user.email;
  const snap = await getDoc(doc(db, "users", user.uid));
  nameInput.value = snap.exists() && snap.data().displayName
    ? snap.data().displayName
    : user.email.split("@")[0];
}

export async function saveProfile(e) {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return alert("Not signed in.");

  const name = document.getElementById("profile-name").value.trim();
  await setDoc(doc(db, "users", user.uid), { displayName: name }, { merge: true });

  const dashName = document.getElementById("user-name");
  if (dashName) dashName.textContent = name;

  const status = document.getElementById("profile-status");
  if (status) {
    status.textContent = "Saved!";
    status.style.color = "var(--gold)";
    setTimeout(() => status.textContent = "", 2000);
  }
}

export async function pageSignout() {
  await signOut(auth);
  localStorage.clear();
  sessionStorage.clear();
  window.location.replace("/signin/");
}

export function pageReset(email) {
  if (!email.includes("@")) return alert("Invalid email.");
  sendPasswordResetEmail(auth, email)
    .then(() => alert("Reset link sent."))
    .catch(e => alert("Error: " + e.message));
}