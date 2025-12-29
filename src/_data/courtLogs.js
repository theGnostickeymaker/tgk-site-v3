export default async () => {
  const res = await fetch(process.env.URL + "/.netlify/functions/get-court-logs");
  if (!res.ok) return { logs: [] };
  return res.json();
};
