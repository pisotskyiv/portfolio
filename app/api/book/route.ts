import { auth } from "@/auth";
import { bookInput } from "@/lib/booking";
import { bookSlot, BookingError } from "@/lib/google-calendar";
import { checkBookingRateLimit } from "@/lib/rate-limit";

// googleapis is Node-only and the handler writes to a calendar; keep it off Edge
// and give it room to do the freebusy + insert round trips.
export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request): Promise<Response> {
  // Booking is gated by Google sign-in. Identity comes from the verified
  // session, never the request body.
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return Response.json(
      { error: "Sign in with Google to book a time." },
      { status: 401 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rate = await checkBookingRateLimit(ip);
  if (!rate.success) {
    return Response.json(
      { error: "Too many booking attempts. Try again later." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bookInput.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid booking request." }, { status: 400 });
  }

  try {
    const result = await bookSlot({
      name: session.user?.name ?? "Guest",
      email,
      date: parsed.data.date,
      time: parsed.data.time,
    });
    return Response.json(result, { status: 200 });
  } catch (err) {
    if (err instanceof BookingError) {
      // "taken" is a conflict the client can recover from by picking another
      // slot (409); "past" and "unavailable" (off-grid / out-of-window) are bad
      // requests (400).
      return Response.json(
        { error: err.message, code: err.code },
        { status: err.code === "taken" ? 409 : 400 },
      );
    }
    console.error("[book] failed", err);
    return Response.json(
      { error: "Booking failed. Please email instead." },
      { status: 503 },
    );
  }
}
