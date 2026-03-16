"use client";

export interface BorderDef {
  id: string;
  name: string;
  rarity: "free" | "premium" | "legendary";
  cssClass: string;
}

export const BORDERS: BorderDef[] = [
  // Free borders (earned via battle pass free track)
  { id: "red_circuit", name: "Red Circuit", rarity: "free", cssClass: "border-red-circuit" },
  { id: "green_terminal", name: "Green Terminal", rarity: "free", cssClass: "border-green-terminal" },
  { id: "blue_neon", name: "Blue Neon", rarity: "free", cssClass: "border-blue-neon" },
  { id: "gold_frame", name: "Gold Frame", rarity: "free", cssClass: "border-gold-frame" },
  // Premium borders (battle pass premium track)
  { id: "plasma_ring", name: "Plasma Ring", rarity: "premium", cssClass: "border-plasma-ring" },
  { id: "void_aura", name: "Void Aura", rarity: "premium", cssClass: "border-void-aura" },
  { id: "fire_ring", name: "Fire Ring", rarity: "premium", cssClass: "border-fire-ring" },
  { id: "diamond_shimmer", name: "Diamond Shimmer", rarity: "premium", cssClass: "border-diamond-shimmer" },
  { id: "rainbow_pulse", name: "Rainbow Pulse", rarity: "premium", cssClass: "border-rainbow-pulse" },
  { id: "cyber_grid", name: "Cyber Grid", rarity: "legendary", cssClass: "border-cyber-grid" },
];

export const BORDER_IDS = BORDERS.map((b) => b.id);

export function getBorder(id: string | null | undefined): BorderDef | undefined {
  if (!id) return undefined;
  return BORDERS.find((b) => b.id === id);
}

export function getBorderClass(id: string | null | undefined): string | null {
  const border = getBorder(id);
  return border?.cssClass ?? null;
}

export function isPremiumBorder(id: string): boolean {
  const border = getBorder(id);
  return border?.rarity === "premium" || border?.rarity === "legendary";
}

export const RARITY_COLORS: Record<string, string> = {
  free: "var(--text-dim)",
  premium: "#aa44ff",
  legendary: "#ffd700",
};
