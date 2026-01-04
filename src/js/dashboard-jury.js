import {
  getFirestore,
  doc,
  getDoc
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

    // 1) Read assignment index
    const assignmentRef = doc(db, "userJuryAssignments", user.uid);
    const assignmentSnap = await getDoc(assignmentRef);

    if (!assignmentSnap.exists()) {
      console.log("[Jury] No assignments found");
      panel.hidden = true;
      return;
    }

    const { cases = [] } = assignmentSnap.data();

    if (!cases.length) {
      console.log("[Jury] Empty assignment list");
      panel.hidden = true;
      return;
    }

    panel.hidden = false;
    container.innerHTML = "";

    // 2) Load each assigned case
    for (const caseId of cases) {
      const caseRef = doc(db, "juryCases", caseId);
      const caseSnap = await getDoc(caseRef);

      if (!caseSnap.exists()) continue;

      const data = caseSnap.data();

      const card = document.createElement("div");
      card.className = "jury-case-card";

      card.innerHTML = `
        <h4>${data.title}</h4>
        <p class="muted small">Status: ${data.status}</p>
        <p class="muted small">Required votes: ${data.requiredVotes}</p>
        <div class="btn-wrap">
          <a href="/court/jury/?case=${caseId}" class="btn outline">
            Review case
          </a>
        </div>
      `;

      container.appendChild(card);
    }

    console.log("[Jury] Jury console rendered");

  } catch (err) {
    console.error("[Jury] Failed to load cases:", err);
    panel.hidden = false;
    container.innerHTML =
      `<p class="muted small">Unable to load jury cases at this time.</p>`;
  }
}
