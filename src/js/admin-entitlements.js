// ============================================================
// TGK Community — Entitlements Manager (Administrator)
// Search, view, and modify user access tiers.
// ============================================================

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();
let currentUser = null;

// Track admin session
onAuthStateChanged(auth, (user) => {
  currentUser = user || null;
});

// ============================================================
// DOM Init
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  initialiseSearch();
  initialiseEditModal();
});

// ============================================================
// Search Handler
// ============================================================
function initialiseSearch() {
  const form = document.getElementById("entitlement-search-form");
  const statusEl = document.getElementById("entitlement-search-status");
  const listEl = document.getElementById("entitlements-list");

  if (!form) return;

  form.addEventListener("submit", async (evt) => {
    evt.preventDefault();

    const queryVal = document.getElementById("search-query").value.trim();
    if (!queryVal) return;

    statusEl.hidden = false;
    statusEl.textContent = "Searching...";

    listEl.innerHTML = "";

    try {
      // Attempt to interpret query as UID
      const userDoc = doc(db, "users", queryVal);
      const userSnap = await getDoc(userDoc);

      if (!userSnap.exists()) {
        statusEl.textContent = "No user found with that UID.";
        return;
      }

      const entDoc = doc(db, "entitlements", queryVal);
      const entSnap = await getDoc(entDoc);

      const tier = entSnap.exists()
        ? entSnap.data().tier
        : "free";

      listEl.innerHTML = `
        <div class="entitlement-card">
          <h3>User UID: ${queryVal}</h3>
          <p><strong>Current Tier:</strong> ${tier}</p>

          <button
            class="btn-secondary btn-edit-entitlement"
            data-uid="${queryVal}"
            data-tier="${tier}">
            Edit
          </button>
        </div>
      `;

      statusEl.hidden = true;

    } catch (error) {
      console.error(error);
      statusEl.textContent = "An error occurred during search.";
    }
  });
}

// ============================================================
// Modal Logic
// ============================================================
function initialiseEditModal() {
  document.addEventListener("click", (evt) => {
    if (!evt.target.classList.contains("btn-edit-entitlement")) return;

    const uid = evt.target.dataset.uid;
    const tier = evt.target.dataset.tier;

    document.getElementById("entitlement-edit-uid").value = uid;
    document.getElementById("entitlement-edit-tier").value = tier;

    document.getElementById("entitlement-edit-modal").hidden = false;
  });

  document.getElementById("entitlement-cancel-btn").onclick = () => {
    document.getElementById("entitlement-edit-modal").hidden = true;
  };

  document.getElementById("entitlement-save-btn").onclick = async () => {
    const uid = document.getElementById("entitlement-edit-uid").value;
    const newTier = document.getElementById("entitlement-edit-tier").value;
    const statusEl = document.getElementById("entitlement-edit-status");

    try {
      await setDoc(
        doc(db, "entitlements", uid),
        { tier: newTier },
        { merge: true }
      );

      statusEl.hidden = false;
      statusEl.textContent = "Entitlement updated.";
      setTimeout(() => location.reload(), 1000);

    } catch (error) {
      console.error(error);
      statusEl.hidden = false;
      statusEl.textContent = "Unable to update entitlement.";
    }
  };
}
