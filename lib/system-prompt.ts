import "server-only";

// The full persona/bio lives off-repo (secret gists served as raw markdown) so
// the public, recruiter-visible route file never ships it.
// SYSTEM_PROMPT_URL — behavioral instructions gist
// PERSONA_URL — bio/background gist
// Both are read from the environment, never committed. If either is unset or
// the fetch fails we degrade to this minimal, generic fallback.
export const FALLBACK_PROMPT = `You are an AI assistant on Vlad Pisotskyi's portfolio website.
Answer questions about Vlad's background, experience, projects, and skills.
Keep responses concise, warm, and professional.
When someone asks about Vlad's availability, schedule, or wants to schedule a call or meeting, use the show_scheduler tool to show live availability.`;

const REVALIDATE_SECONDS = 300;

async function fetchPart(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) {
      console.warn(`[system-prompt] fetch ${url} → ${res.status}; skipping`);
      return null;
    }
    const text = (await res.text()).trim();
    return text || null;
  } catch (err) {
    console.warn(`[system-prompt] fetch ${url} failed; skipping`, err);
    return null;
  }
}

export async function getSystemPrompt(): Promise<string> {
  const systemUrl = process.env.SYSTEM_PROMPT_URL;
  const personaUrl = process.env.PERSONA_URL;

  if (!systemUrl && !personaUrl) return FALLBACK_PROMPT;

  const [systemPart, personaPart] = await Promise.all([
    systemUrl ? fetchPart(systemUrl) : Promise.resolve(null),
    personaUrl ? fetchPart(personaUrl) : Promise.resolve(null),
  ]);

  const combined = [systemPart, personaPart].filter(Boolean).join("\n\n");
  return combined || FALLBACK_PROMPT;
}
