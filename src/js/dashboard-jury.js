// /js/dashboard-jury.js

import {
  getFirestore,
  collectionGroup,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const db = getFirestore();

export async function loadJuryConsole(user) {
  const mount = document.getElementById("jury-cases");
  const section = document.getElementById("jury-console");

  if (!mount || !section) return;

  console.log("[Jury] Loading jury console for", user.uid);

  mount.innerHTML = `<p class="muted small">Loading assigned cases…</p>`;

  try {
    // 🔑 Query juror assignments
    const q = query(
      collectionGroup(db, "jurors"),
      where("__name__", "==", user.uid)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      mount.innerHTML = `
        <p class="muted small">
          You are not currently assigned to any jury cases.
        </p>
      `;
      section.style.display = "none"; // hide whole panel if none
      return;
    }

    section.style.display = "block";

    let html = "";

    for (const jurorDoc of snap.docs) {
      const caseRef = jurorDoc.ref.parent.parent;
      if (!caseRef) continue;

      const caseSnap = await getDoc(caseRef);
      if (!caseSnap.exists()) continue;

      const data = caseSnap.data();

      html += `
        <article class="jury-case card">
          <h4>${data.title || "Community Case"}</h4>
          <p class="small muted">
            Status: <strong>${data.status}</strong>
          </p>
          <p class="small muted">
            Required votes: ${data.requiredVotes ?? "—"}
          </p>
          <div class="btn-wrap">
            <a href="/jury/${caseRef.id}/" class="btn outline small">
              Review case
            </a>
          </div>
        </article>
      `;
    }

    mount.innerHTML = html;

  } catch (err) {
    console.error("[Jury] Failed to load jury cases:", err);
    mount.innerHTML = `
      <p class="small muted">
        Unable to load jury cases at this time.
      </p>
    `;
  }
}
