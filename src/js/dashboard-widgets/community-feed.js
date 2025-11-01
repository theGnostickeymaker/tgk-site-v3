/* ===========================================================
   🗣️ TGK Widget — Community Feed (v0.1 seed)
   =========================================================== */

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { app } from "/js/firebase-init.js";

const auth = getAuth(app);
const db = getFirestore(app);
const mountId = "widget-community-feed";

async function renderCommunityFeed(user) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  mount.innerHTML = `<p class="muted small">Loading community posts…</p>`;

  try {
    const q = query(collection(db, "communityPosts"), orderBy("created", "desc"), limit(5));
    const snap = await getDocs(q);

    if (snap.empty) {
      mount.innerHTML = `<p class="muted small">No community activity yet.</p>`;
      return;
    }

    const list = document.createElement("ul");
    list.className = "community-feed-list";

    snap.forEach(docSnap => {
      const post = docSnap.data();
      const li = document.createElement("li");
      li.innerHTML = `
        <a href="/community/thread/${post.threadId || docSnap.id}/">
          ${post.title || "Untitled Post"}
        </a>
        <span class="muted small">by ${post.authorName || "Anonymous"}</span>
      `;
      list.appendChild(li);
    });

    mount.innerHTML = `<h3>Community Feed</h3>`;
    mount.appendChild(list);
  } catch (err) {
    console.error("[TGK Community Widget] Error:", err);
    mount.innerHTML = `<p class="muted small">Error loading feed.</p>`;
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) renderCommunityFeed(user);
});
