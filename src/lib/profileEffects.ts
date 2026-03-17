"use client";

// ── Name Colors ──────────────────────────────────────────────────────────────
export interface NameColorDef {
  id: string;
  name: string;
  css: string; // CSS color or gradient value
}

export const NAME_COLORS: NameColorDef[] = [
  { id: "nc_crimson", name: "Crimson", css: "#ff2244" },
  { id: "nc_cyan", name: "Cyan Pulse", css: "#00e5ff" },
  { id: "nc_gold", name: "Gold", css: "#ffd700" },
  { id: "nc_toxic", name: "Toxic Green", css: "#39ff14" },
  { id: "nc_purple", name: "Royal Purple", css: "#aa44ff" },
  { id: "nc_sunset", name: "Sunset Fade", css: "linear-gradient(90deg, #ff6b35, #ff2244, #aa44ff)" },
  { id: "nc_ice", name: "Ice Blue", css: "linear-gradient(90deg, #00e5ff, #e0f7fa)" },
  { id: "nc_fire", name: "Flame", css: "linear-gradient(90deg, #ff4400, #ffd700)" },
];

// ── Profile Effects (animated overlays / card backgrounds) ──────────────────
export interface ProfileEffectDef {
  id: string;
  name: string;
  cssClass: string; // class applied to profile card
  description: string;
}

export const PROFILE_EFFECTS: ProfileEffectDef[] = [
  { id: "pe_scanlines", name: "Scanlines", cssClass: "pe-scanlines", description: "Retro CRT scanline overlay" },
  { id: "pe_matrix", name: "Matrix Rain", cssClass: "pe-matrix", description: "Falling green code rain" },
  { id: "pe_glitch", name: "Glitch Flicker", cssClass: "pe-glitch", description: "Random glitch distortions" },
  { id: "pe_neon_grid", name: "Neon Grid", cssClass: "pe-neon-grid", description: "Animated perspective grid" },
  { id: "pe_particles", name: "Particle Field", cssClass: "pe-particles", description: "Floating neon particles" },
];

export function getNameColor(id: string | null | undefined): NameColorDef | undefined {
  if (!id) return undefined;
  return NAME_COLORS.find((c) => c.id === id);
}

export function getProfileEffect(id: string | null | undefined): ProfileEffectDef | undefined {
  if (!id) return undefined;
  return PROFILE_EFFECTS.find((e) => e.id === id);
}

/** Returns inline style for a name color (handles both solid and gradient) */
export function getNameColorStyle(id: string | null | undefined): React.CSSProperties | undefined {
  const def = getNameColor(id);
  if (!def) return undefined;
  if (def.css.includes("gradient")) {
    return {
      background: def.css,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    };
  }
  return { color: def.css };
}
