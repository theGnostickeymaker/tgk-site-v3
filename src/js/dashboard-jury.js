import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const db = getFirestore();

export async function loadJuryConsole(user) {
  const container = document.getElementById("jury-cases");
  const panel = document.getElementById("jury-console");

  if (!container || !panel) return;

  container.innerHTML = `<p class="muted small">Loading assigned cases…</p>`;

  try {
    console.log("[Jury] Loading assignments for user:", user.uid);

    // Get the user's assignment document
    const assignmentRef = doc(db, "userJuryAssignments", user.uid);
    const assignmentSnap = await getDoc(assignmentRef);

    if (!assignmentSnap.exists() || !assignmentSnap.data().assignedCases?.length) {
      console.log("[Jury] No assignments found");
      panel.style.display = "none";
      return;
    }

    const caseIds = assignmentSnap.data().assignedCases;
    console.log("[Jury] Found", caseIds.length, "assigned cases:", caseIds);

    const assignedCases = [];

    // Fetch each assigned case
    for (const caseId of caseIds) {
      try {
        const caseRef = doc(db, "juryCases", caseId);
        const caseSnap = await getDoc(caseRef);

        if (caseSnap.exists()) {
          console.log("[Jury] Loaded case:", caseId);
          assignedCases.push({ id: caseSnap.id, ...caseSnap.data() });
        } else {
          console.warn("[Jury] Case not found:", caseId);
        }
      } catch (err) {
        console.error("[Jury] Error loading case", caseId, ":", err);
      }
    }

    if (assignedCases.length === 0) {
      panel.style.display = "none";
      return;
    }

    panel.style.display = "block";
    container.innerHTML = "";

    for (const data of assignedCases) {
      const card = document.createElement("div");
      card.className = "jury-case-card";

      card.innerHTML = `
        <h4>${data.title}</h4>
        <p class="muted small">Status: ${data.status}</p>
        <p class="muted small">Required votes: ${data.requiredVotes}</p>
        <div class="btn-wrap">
          <a href="/court/jury/${data.id}/" class="btn outline">
            Review case
          </a>
        </div>
      `;

      container.appendChild(card);
    }

    console.log("[Jury] Successfully loaded", assignedCases.length, "cases");

  } catch (err) {
    console.error("[Jury] Failed to load cases:", err);
    container.innerHTML =
      `<p class="muted small">Unable to load jury cases at this time.</p>`;
  }
}