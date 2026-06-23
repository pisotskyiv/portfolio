// Client-safe chat limits. The single source of truth for the input cap, shared
// by the server guard in app/api/chat/route.ts (413 over the limit) and the
// client maxLength + character counter in ChatDrawer.
export const MAX_INPUT_CHARS = 4000;
