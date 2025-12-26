// netlify/functions/send-email.js

export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const token = process.env.POSTMARK_SERVER_TOKEN;
    if (!token) {
      return { statusCode: 500, body: "Missing POSTMARK_SERVER_TOKEN" };
    }

    const body = JSON.parse(event.body || "{}");
    const { to, subject, text, html, from } = body;

    if (!to || !subject || (!text && !html)) {
      return { statusCode: 400, body: "Missing required fields" };
    }

    const payload = {
      From: from || process.env.MAIL_FROM || "The Gnostic Key <noreply@yourdomain>",
      To: to,
      Subject: subject,
      TextBody: text || undefined,
      HtmlBody: html || undefined,
      MessageStream: "outbound"
    };

    const res = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": token
      },
      body: JSON.stringify(payload)
    });

    const out = await res.text();
    if (!res.ok) {
      return { statusCode: 502, body: out };
    }

    return { statusCode: 200, body: out };
  } catch (err) {
    return { statusCode: 500, body: err?.message || "Unknown error" };
  }
}
