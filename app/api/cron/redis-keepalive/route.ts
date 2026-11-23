import { Redis } from "@upstash/redis";

// Daily heartbeat for the rate-limit Redis. Upstash removes free databases
// that sit idle, and this one is only touched when someone chats or books, so
// a quiet stretch can delete it and take both endpoints down (they fail
// closed). One write a day keeps it active. Scheduled in vercel.json.

export const runtime = "nodejs";

export async function GET(req: Request) {
  // Vercel sends CRON_SECRET as a Bearer token on scheduled runs. No secret
  // configured means nobody gets in, not everybody.
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    console.error("[cron] redis keepalive skipped: Upstash not configured");
    return Response.json({ ok: false }, { status: 500 });
  }

  try {
    // A timestamp, so the last successful run is visible in the Upstash console.
    await new Redis({ url, token }).set("keepalive:last", new Date().toISOString());
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[cron] redis keepalive failed", err);
    return Response.json({ ok: false }, { status: 502 });
  }
}
