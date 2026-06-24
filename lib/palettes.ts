export type Palette = {
  name: string;
  bg: string;
  surface: string;
  accent: string;
  accentHover: string;
  text: string;
  muted: string;
  border: string;
};

export const iron: Palette = {
  name: "iron",
  bg: "#0A0A0A",        // zinc-950
  surface: "#1C1C1C",   // zinc-900
  accent: "#DC2626",    // red-600
  accentHover: "#B91C1C", // red-700
  text: "#F0F0F0",      // zinc-100
  muted: "#6B7280",     // gray-500
  border: "#2A2A2A",
};

export const depth: Palette = {
  name: "depth",
  bg: "#0A0F1E",        // slate-950
  surface: "#0F172A",   // slate-900
  accent: "#38BDF8",    // sky-400
  accentHover: "#0284C7", // sky-600
  text: "#E2E8F0",      // slate-200
  muted: "#94A3B8",     // slate-400
  border: "#1E293B",
};

export const obsidian: Palette = {
  name: "obsidian",
  bg: "#000000",        // black
  surface: "#141414",
  accent: "#FFFFFF",    // white (mono accent)
  accentHover: "#E5E5E5",
  text: "#E5E5E5",      // neutral-200
  muted: "#737373",     // neutral-500
  border: "#1A1A1A",
};

export const copper: Palette = {
  name: "copper",
  bg: "#0F0C09",        // warm near-black (matches @theme)
  surface: "#1C150F",   // card surface (matches @theme)
  accent: "#C3753A",    // copper tone (matches @theme)
  accentHover: "#92400E", // amber-800
  text: "#F5EDE4",      // warm off-white
  muted: "#C2B4A6",     // warm gray (matches @theme)
  border: "#3A2E24",    // visible border (matches @theme)
};

export const voltage: Palette = {
  name: "voltage",
  bg: "#0F0F0F",        // neutral-950
  surface: "#1C1C1C",   // neutral-900
  accent: "#84CC16",    // lime-400
  accentHover: "#4D7C0F", // lime-700
  text: "#F5F5F5",      // neutral-100
  muted: "#737373",     // neutral-500
  border: "#262626",
};

// Active palette — change this one line to switch themes
export const activePalette = copper;
