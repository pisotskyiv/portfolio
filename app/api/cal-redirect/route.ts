// Logs a "finalize opened" signal, then bounces the visitor to Google's
// add-to-calendar page. This is the closest we get to confirmation on personal
// Gmail: Google fires no callback when the visitor actually saves the event, so
// "opened finalize" is the ceiling. The real confirmation loop is a follow-up
// email.
export const runtime = "nodejs";

// Only ever redirect to Google Calendar's render page. Without this allowlist
// `?to=` would turn our domain into an open redirector usable for phishing.
const ALLOWED_HOST = "calendar.google.com";
const ALLOWED_PATH = "/calendar/render";

export function GET(req: Request): Response {
  const to = new URL(req.url).searchParams.get("to");

  let dest: URL;
  try {
    dest = new URL(to ?? "");
  } catch {
    return new Response("Invalid target.", { status: 400 });
  }

  if (dest.protocol !== "https:" || dest.hostname !== ALLOWED_HOST || dest.pathname !== ALLOWED_PATH) {
    return new Response("Forbidden target.", { status: 400 });
  }

  console.info("[cal-redirect] finalize opened", {
    dates: dest.searchParams.get("dates"),
  });

  return Response.redirect(dest.toString(), 302);
}
