import "server-only";

// The full persona/bio lives off-repo (a secret gist served as raw markdown) so
// the public, recruiter-visible route file never ships it. PROMPT_URL points at
// the raw URL; it is read from the environment, never committed. If the env is
// unset or the fetch fails, we degrade to this minimal, generic fallback rather
// than leak details or break the chat.
export const FALLBACK_PROMPT = `You are an AI assistant on Vlad Pisotski's portfolio website.
Answer questions about Vlad's background, experience, projects, and skills.
Keep responses concise, warm, and professional.
When someone wants to schedule a call or meeting, use the show_scheduler tool to show live availability.`;

// Cache window for the hosted prompt. Next's data cache serves the fetched copy
// for this many seconds, so editing the gist propagates within the TTL without a
// redeploy and without fetching on every request.
const REVALIDATE_SECONDS = 300;

export async function getSystemPrompt(): Promise<string> {
  const url = process.env.PROMPT_URL;
  if (!url) return FALLBACK_PROMPT;

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) {
      console.warn(`[system-prompt] fetch ${res.status}; using fallback`);
      return FALLBACK_PROMPT;
    }
    const text = (await res.text()).trim();
    return text || FALLBACK_PROMPT;
  } catch (err) {
    console.warn("[system-prompt] fetch failed; using fallback", err);
    return FALLBACK_PROMPT;
  }
}
