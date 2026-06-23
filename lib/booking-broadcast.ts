// Cross-tab signaling for the booking flow. The booking lifecycle runs in a
// separate tab (so the chat tab is never disturbed by the OAuth redirect); when
// it finishes it broadcasts the outcome back here so the chat tab can toast it.
//
// BroadcastChannel is the primary transport; where it is unavailable we fall
// back to a localStorage write, which fires a `storage` event in other tabs.

export interface BookingResult {
  status: "success" | "error";
  /** Human-readable slot label, e.g. "Wed Jun 24, 12pm PT". */
  when: string;
  /** Add-to-calendar link; present on success. */
  link?: string;
}

const CHANNEL_NAME = "booking";
const STORAGE_KEY = "booking:result";

function hasBroadcastChannel(): boolean {
  return typeof BroadcastChannel !== "undefined";
}

export function publishBookingResult(result: BookingResult): void {
  if (hasBroadcastChannel()) {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(result);
    channel.close();
    return;
  }
  try {
    // A timestamp guarantees the value changes, so a `storage` event fires even
    // when two identical results are published in a row.
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...result, _t: Date.now() }));
  } catch {
    // Storage unavailable (private mode, quota) — nothing more we can do here.
  }
}

export function subscribeBookingResult(
  onResult: (result: BookingResult) => void,
): () => void {
  if (hasBroadcastChannel()) {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent) => {
      onResult(event.data as BookingResult);
    };
    return () => channel.close();
  }

  const handler = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      onResult(JSON.parse(event.newValue) as BookingResult);
    } catch {
      // Ignore malformed payloads.
    }
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
