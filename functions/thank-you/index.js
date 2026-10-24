// Cloudflare Pages Function for POST /thank-you/ (Contact Form submission)
// Validates Same-Origin, enforces honeypot, and redirects (303 See Other) to GET /thank-you/

const ALLOWED_ORIGINS = new Set(["https://japanstarter.com", "https://www.japanstarter.com"]);

export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = request.headers.get("origin") || "";
  const url = new URL(request.url);
  if (origin && !ALLOWED_ORIGINS.has(origin) && origin !== url.origin) {
    return new Response("Forbidden origin", { status: 403 });
  }
  try {
    const form = await request.formData();
    const bot = String(form.get("bot-field") || "").trim();
    if (!bot && env && env.JAPANSTARTER_KV) {
      const name = String(form.get("name") || "").trim().slice(0, 120);
      const email = String(form.get("email") || "").trim().slice(0, 200);
      const topic = String(form.get("topic") || "General").trim().slice(0, 80);
      const message = String(form.get("message") || "").trim().slice(0, 4000);
      if (name && email && message) {
        const id = "msg/" + new Date().toISOString() + "-" + crypto.randomUUID().slice(0, 8);
        await env.JAPANSTARTER_KV.put(id, JSON.stringify({ name, email, topic, message, created: new Date().toISOString() }), {
          expirationTtl: 60 * 60 * 24 * 90 // 90-day retention per privacy policy
        });
      }
    }
  } catch {}
  return Response.redirect(new URL("/thank-you/", request.url).toString(), 303);
}
