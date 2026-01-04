import {
  getFirestore,
  collectionGroup,
  getDocs,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const db = getFirestore();

export async function loadJuryConsole(user) {
  const container = document.getElementById("jury-cases");
  const panel = document.getElementById("jury-console");

  if (!container || !panel || !user) return;

  container.innerHTML = `<p class="muted small">Loading assigned cases…</p>`;
  panel.style.display = "none";

  try {
    const jurorSnap = await getDocs(collectionGroup(db, "jurors"));

    const matchingJurorDocs = jurorSnap.docs.filter(
      doc => doc.id === user.uid
    );

    if (!matchingJurorDocs.length) {
      return;
    }

    panel.style.display = "block";
    container.innerHTML = "";

    for (const jurorDoc of matchingJurorDocs) {
      const caseRef = jurorDoc.ref.parent.parent;
      const caseSnap = await getDoc(caseRef);

      if (!caseSnap.exists()) continue;

      const data = caseSnap.data();

      if (data.status !== "open") continue;

      const card = document.createElement("div");
      card.className = "jury-case-card";

      card.innerHTML = `
        <h4>${data.title}</h4>
        <p class="muted small">
          Threshold: ${data.threshold} · Required votes: ${data.requiredVotes}
        </p>

        <div class="btn-wrap">
          <a href="/court/jury/${caseSnap.id}/" class="btn outline small">
            Review case
          </a>
        </div>
      `;

      container.appendChild(card);
    }

    if (!container.children.length) {
      container.innerHTML =
        `<p class="muted small">No active jury cases.</p>`;
    }

  } catch (err) {
    console.error("[Jury] Failed to load cases:", err);
    container.innerHTML =
      `<p class="muted small">Unable to load jury cases at this time.</p>`;
  }
}
