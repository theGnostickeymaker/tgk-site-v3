import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";

const firebaseConfig = {
  // paste your existing client config from the site
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const logId = "test-log-001";

  const logRef = doc(db, "courtLogs", logId);
  const logSnap = await getDoc(logRef);

  console.log("LOG EXISTS:", logSnap.exists());
  console.log("LOG DATA:", logSnap.data());

  const entriesRef = collection(db, "courtLogs", logId, "entries");
  const q = query(entriesRef, orderBy("sequence", "asc"));
  const entriesSnap = await getDocs(q);

  console.log("ENTRIES COUNT:", entriesSnap.size);
  entriesSnap.forEach((d) => console.log(d.id, d.data()));
}

run().catch(console.error);
