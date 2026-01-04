import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const db = getFirestore();

export async function loadJuryConsole(user) {
  const panel = document.getElementById("jury-console");
  const container = document.getElementById("jury-cases");

  if (!panel || !container) return;

  panel.hidden = true;
  container.innerHTML = `<p class="muted small">Loading assigned cases…</p>`;

  try {
    console.log("[Jury] Loading assignments for user:", user.uid);

    // 1) Find juror assignments
    const jurorCol = collection(db, "juryCases");
    const casesSnap = await getDocs(jurorCol);

    const assignedCases = [];

    for (const caseDoc of casesSnap.docs) {
      const jurorRef = doc(db, "juryCases", caseDoc.id, "jurors", user.uid);
      const jurorSnap = await getDoc(jurorRef);

      if (jurorSnap.exists()) {
        assignedCases.push({
          id: caseDoc.id,
          data: caseDoc.data()
        });
      }
    }

    console.log("[Jury] Found assigned cases:", assignedCases.map(c => c.id));

    if (!assignedCases.length) {
      panel.hidden = true;
      return;
    }

    // 2) Show panel
    panel.hidden = false;
    container.innerHTML = "";

    // 3) Render cards
    for (const c of assignedCases) {
      const card = document.createElement("div");
      card.className = "jury-case-card";

      card.innerHTML = `
        <h4>${c.data.title}</h4>
        <p class="muted small">Status: ${c.data.status}</p>
        <p class="muted small">Required votes: ${c.data.requiredVotes}</p>
        <div class="btn-wrap">
          <a
            href="/court/jury/?case=${c.id}"
            class="btn outline"
          >
            Review case
          </a>
        </div>
      `;

      container.appendChild(card);
    }

  } catch (err) {
    console.error("[Jury] Failed to load cases:", err);
    panel.hidden = false;
    container.innerHTML =
      `<p class="muted small">Unable to load jury cases at this time.</p>`;
  }
}
