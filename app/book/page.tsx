import { auth } from "@/auth";
import { bookInput, formatSlotLabel } from "@/lib/booking";
import { BookingPanel } from "@/components/ui/BookingPanel";
import { ContactFallback } from "@/components/ui/ContactFallback";

// Reads the Auth.js session server-side; keep it off Edge.
export const runtime = "nodejs";

interface BookPageProps {
  searchParams: Promise<{ date?: string; time?: string }>;
}

/**
 * Dedicated booking tab, keyed entirely by URL (date/time) + the session
 * cookie — both survive the Google OAuth full-page redirect, so the whole
 * lifecycle is self-contained here and the chat tab is never disturbed.
 */
export default async function BookPage({ searchParams }: BookPageProps) {
  const { date, time } = await searchParams;
  const parsed = bookInput.safeParse({ date, time });

  if (!parsed.success) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-6 py-12">
        <h1 className="text-lg font-medium text-text">Schedule a call</h1>
        <div className="flex flex-col gap-2 text-sm text-muted">
          <p>That booking link is missing or malformed. Pick a slot from the chat.</p>
          <ContactFallback />
        </div>
      </main>
    );
  }

  const session = await auth();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-6 py-12">
      <h1 className="text-lg font-medium text-text">Schedule a call</h1>
      <BookingPanel
        date={parsed.data.date}
        time={parsed.data.time}
        whenLabel={formatSlotLabel(parsed.data.date, parsed.data.time)}
        signedIn={Boolean(session?.user?.email)}
        name={session?.user?.name}
        email={session?.user?.email}
      />
    </main>
  );
}
