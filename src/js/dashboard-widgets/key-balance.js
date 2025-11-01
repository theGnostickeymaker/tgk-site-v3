/* ===========================================================
   🜂 TGK Widget — Key Balance (Forge Credits v0.1 seed)
   =========================================================== */

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { app } from "/js/page.js";

const auth = getAuth(app);
const db = getFirestore(app);
const mountId = "widget-key-balance";

async function renderKeyBalance(user) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  mount.innerHTML = `<p class="muted small">Checking your balance…</p>`;

  try {
    const ref = doc(db, "keys", user.uid);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : { balance: 0 };

    mount.innerHTML = `
      <div class="widget-box">
        <h3>Forge Keys</h3>
        <p>Current balance: <strong>${data.balance || 0}</strong> 🔑</p>
        <p class="small"><a href="/shop/">Earn or spend Keys</a></p>
      </div>
    `;
  } catch (err) {
    console.error("[TGK Key Widget] Error:", err);
    mount.innerHTML = `<p class="muted small">Error loading balance.</p>`;
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) renderKeyBalance(user);
});
