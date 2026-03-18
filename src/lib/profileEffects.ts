"use client";

// ── Name Colors ──────────────────────────────────────────────────────────────
export interface NameColorDef {
  id: string;
  name: string;
  css: string; // CSS color or gradient value
}

// Only colors that are obtainable through the battle pass or store.
// Chapter 1 premium: nc_crimson (tier 1), nc_cyan (tier 6)
// Chapter 2 premium: nc_gold (tier 31), nc_neon_green (tier 35), nc_violet (tier 49)
export const NAME_COLORS: NameColorDef[] = [
  { id: "nc_crimson",    name: "Crimson",    css: "#ff2244" },
  { id: "nc_cyan",       name: "Cyan Pulse", css: "#00e5ff" },
  { id: "nc_gold",       name: "Gold",       css: "#ffd700" },
  { id: "nc_neon_green", name: "Neon Green", css: "#00ff88" },
  { id: "nc_violet",     name: "Violet",     css: "#cc55ff" },
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
