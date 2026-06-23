import { describe, it, expect, vi, afterEach } from "vitest";
import {
  publishBookingResult,
  subscribeBookingResult,
  type BookingResult,
} from "./booking-broadcast";

const RESULT: BookingResult = {
  status: "success",
  when: "Wed Jun 24, 12pm PT",
  link: "https://calendar.google.com/calendar/render?action=TEMPLATE",
};

class FakeBroadcastChannel {
  static instances: FakeBroadcastChannel[] = [];
  name: string;
  onmessage: ((e: { data: unknown }) => void) | null = null;
  posted: unknown[] = [];
  closed = false;
  constructor(name: string) {
    this.name = name;
    FakeBroadcastChannel.instances.push(this);
  }
  postMessage(data: unknown) {
    this.posted.push(data);
  }
  close() {
    this.closed = true;
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  FakeBroadcastChannel.instances = [];
  localStorage.clear();
});

describe("booking-broadcast — BroadcastChannel path", () => {
  it("publishes the result on the booking channel and closes it", () => {
    vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);

    publishBookingResult(RESULT);

    const ch = FakeBroadcastChannel.instances.at(-1)!;
    expect(ch.name).toBe("booking");
    expect(ch.posted).toEqual([RESULT]);
    expect(ch.closed).toBe(true);
  });

  it("subscribes and invokes the callback on a message, unsubscribe closes", () => {
    vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
    const cb = vi.fn();

    const unsubscribe = subscribeBookingResult(cb);
    const ch = FakeBroadcastChannel.instances.at(-1)!;
    ch.onmessage?.({ data: RESULT });
    expect(cb).toHaveBeenCalledWith(RESULT);

    unsubscribe();
    expect(ch.closed).toBe(true);
  });
});

describe("booking-broadcast — localStorage fallback", () => {
  it("falls back to localStorage when BroadcastChannel is unavailable", () => {
    vi.stubGlobal("BroadcastChannel", undefined);

    publishBookingResult(RESULT);

    const raw = localStorage.getItem("booking:result");
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toMatchObject(RESULT);
  });

  it("subscribes via the storage event and ignores unrelated keys", () => {
    vi.stubGlobal("BroadcastChannel", undefined);
    const cb = vi.fn();
    const unsubscribe = subscribeBookingResult(cb);

    window.dispatchEvent(
      new StorageEvent("storage", { key: "unrelated", newValue: "x" }),
    );
    expect(cb).not.toHaveBeenCalled();

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "booking:result",
        newValue: JSON.stringify(RESULT),
      }),
    );
    expect(cb).toHaveBeenCalledWith(expect.objectContaining(RESULT));

    unsubscribe();
    cb.mockClear();
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "booking:result",
        newValue: JSON.stringify(RESULT),
      }),
    );
    expect(cb).not.toHaveBeenCalled();
  });
});
