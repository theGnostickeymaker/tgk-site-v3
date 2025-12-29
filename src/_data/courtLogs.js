export default async () => {
  try {
    const base =
      process.env.ELEVENTY_ENV === "production"
        ? "https://thegnostickey.com"
        : "http://localhost:8888";

    const res = await fetch(`${base}/.netlify/functions/get-court-logs`);
    if (!res.ok) {
      return { logs: [] };
    }

    return await res.json();
  } catch (err) {
    return { logs: [] };
  }
};
