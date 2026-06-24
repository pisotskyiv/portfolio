export function openChat() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("chat:open"));
}
