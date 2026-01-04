import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  collectionGroup,
  query,
  where,
  doc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const db = getFirestore();

export async function loadJuryConsole(user) {
  const container = document.getElementById("jury-cases");
  const panel = document.getElementById("jury-console");

  if (!container || !panel) return;

  container.innerHTML = `<p class="muted small">Loading assigned cases…</p>`;

  try {
    console.log("[Jury] Starting jury console load for user:", user.uid);

    // Query the collectionGroup for juror assignments matching this user
    const jurorQuery = query(
      collectionGroup(db, "jurors"),
      where("uid", "==", user.uid)
    );

    console.log("[Jury] Executing collectionGroup query...");
    const jurorSnap = await getDocs(jurorQuery);
    console.log("[Jury] Query returned", jurorSnap.size, "juror documents");

    if (jurorSnap.empty) {
      console.log("[Jury] No juror assignments found");
      panel.style.display = "none";
      return;
    }

    const assignedCases = [];

    // For each juror assignment, fetch the parent case document
    for (const jurorDoc of jurorSnap.docs) {
      const caseId = jurorDoc.ref.parent.parent.id;
      console.log("[Jury] Found assignment for case:", caseId);
      console.log("[Jury] Juror doc path:", jurorDoc.ref.path);
      
      const caseRef = doc(db, "juryCases", caseId);
      console.log("[Jury] Attempting to fetch case document...");
      
      try {
        const caseSnap = await getDoc(caseRef);
        console.log("[Jury] Case fetch result - exists:", caseSnap.exists());
        
        if (caseSnap.exists()) {
          console.log("[Jury] Case data:", caseSnap.data());
          assignedCases.push({ id: caseSnap.id, ...caseSnap.data() });
        }
      } catch (caseErr) {
        console.error("[Jury] Error fetching case", caseId, ":", caseErr);
      }
    }

    console.log("[Jury] Total assigned cases loaded:", assignedCases.length);

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

  } catch (err) {
    console.error("[Jury] Failed to load cases:", err);
    console.error("[Jury] Error details:", err.code, err.message);
    container.innerHTML =
      `<p class="muted small">Unable to load jury cases at this time.</p>`;
  }
}