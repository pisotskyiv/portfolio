import { getAvailability } from "@/lib/google-calendar";

export const runtime = "nodejs";

const MAX_WEEK_OFFSET = 4;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = parseInt(url.searchParams.get("week") ?? "0", 10);
  if (!Number.isFinite(raw) || raw < 0 || raw > MAX_WEEK_OFFSET) {
    return Response.json(
      { error: `Week offset must be between 0 and ${MAX_WEEK_OFFSET}.` },
      { status: 400 },
    );
  }
  const availability = await getAvailability(new Date(), raw);
  return Response.json({ availability });
}
