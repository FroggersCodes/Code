"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPlayer, savePlayer } from "@/lib/storage";
import { AVATARS, PREMIUM_AVATAR_IDS } from "@/lib/avatars";
import { PREMIUM_TITLES, getTitleClass } from "@/lib/titles";
import type { Player } from "@/types";

// ── Store configuration ────────────────────────────────────────────────────
const SUPPORT_URL = "https://ko-fi.com/bugracer"; // Replace with your actual URL

const STORE_ITEMS = {
  avatars: {
    id: "avatar_pack",
    name: "AVATAR PACK",
    description: "3 exclusive animated avatars: Dragon, Phoenix & Void",
    price: "$2.99",
    color: "#ff0033",
  },
  titles: {
    id: "title_pack",
    name: "TITLE PACK",
    description: "3 premium animated titles: Neon Phantom, Void Walker & Cyber Dragon",
    price: "$2.99",
    color: "#9900ff",
  },
  bundle: {
    id: "ultimate_bundle",
    name: "ULTIMATE BUNDLE",
    description: "All 3 avatars + all 3 titles — save $1!",
    price: "$4.99",
    priceOriginal: "$5.98",
    color: "#ffd700",
  },
} as const;

function RedeemSection({ player, setPlayer }: { player: Player; setPlayer: (p: Player) => void }) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleRedeem = () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    // Code format: AVATAR-XXXXX, TITLE-XXXXX, BUNDLE-XXXXX
    // These would be generated/validated server-side in production.
    // For now, we use a simple local code system.
    const codes = getRedeemCodes();
    const found = codes.find((c) => c.code === trimmed && !c.used);

    if (!found) {
      setStatus({ type: "error", text: "Invalid or already used code" });
      return;
    }

    // Apply the unlock
    const updated = { ...player };
    if (found.type === "avatars" || found.type === "bundle") {
      const current = updated.unlockedAvatars ?? [];
      const toAdd = PREMIUM_AVATAR_IDS.filter((id) => !current.includes(id));
      updated.unlockedAvatars = [...current, ...toAdd];
    }
    if (found.type === "titles" || found.type === "bundle") {
      const current = updated.unlockedTitles ?? [];
      const toAdd = PREMIUM_TITLES.map((t) => t.id).filter((id) => !current.includes(id));
      updated.unlockedTitles = [...current, ...toAdd];
    }

    // Mark code as used
    markCodeUsed(trimmed);
    savePlayer(updated);
    setPlayer(updated);
    setCode("");
    setStatus({ type: "success", text: "Unlocked! Check your profile." });
  };

  return (
    <div className="hacker-card mb-6">
      <div className="text-xs text-[var(--accent-green)] tracking-wider mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>
        REDEEM CODE
      </div>
      <div className="text-[10px] text-[var(--text-muted)] mb-3 leading-relaxed">
        Have a purchase code? Enter it below to unlock your items.
      </div>
      <div className="flex gap-2">
        <input
          className="hacker-input flex-1 text-sm tracking-widest"
          placeholder="ENTER-CODE_"
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setStatus(null); }}
          onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
          maxLength={30}
        />
        <button
          onClick={handleRedeem}
          className="px-4 py-2 text-xs tracking-widest border border-[var(--accent-green)] text-[var(--accent-green)] hover:bg-[rgba(0,255,102,0.1)] transition-colors rounded bg-transparent cursor-pointer"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          REDEEM
        </button>
      </div>
      {status && (
        <div className={`text-xs mt-2 tracking-wider ${status.type === "success" ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"}`}>
          {status.text}
        </div>
      )}
    </div>
  );
}

// ── Simple local code storage (would be server-side in production) ──────
interface RedeemCode {
  code: string;
  type: "avatars" | "titles" | "bundle";
  used: boolean;
}

const CODES_KEY = "bugracer_redeem_codes";

function getRedeemCodes(): RedeemCode[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(CODES_KEY);
  return data ? JSON.parse(data) : [];
}

function markCodeUsed(code: string): void {
  const codes = getRedeemCodes();
  const found = codes.find((c) => c.code === code);
  if (found) {
    found.used = true;
    localStorage.setItem(CODES_KEY, JSON.stringify(codes));
  }
}

export default function StorePage() {
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    setPlayer(getPlayer());
  }, []);

  const hasAllAvatars = player && PREMIUM_AVATAR_IDS.every((id) => (player.unlockedAvatars ?? []).includes(id));
  const hasAllTitles = player && PREMIUM_TITLES.every((t) => (player.unlockedTitles ?? []).includes(t.id));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-sm text-[var(--accent-red)] glow-red font-bold tracking-widest"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          STORE
        </h1>
        <button
          onClick={() => router.push("/")}
          className="text-xs text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors bg-transparent border-none cursor-pointer tracking-wider"
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          ← BACK
        </button>
      </div>

      <div className="text-[10px] text-[var(--text-muted)] mb-6 tracking-wider leading-relaxed">
        SUPPORT BUGRACER — GET EXCLUSIVE ANIMATED COSMETICS
      </div>

      {/* Avatar Pack */}
      <div className="hacker-card mb-4" style={{ borderColor: "rgba(255,0,51,0.4)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs tracking-wider" style={{ color: STORE_ITEMS.avatars.color, fontFamily: "'Orbitron', sans-serif" }}>
            {STORE_ITEMS.avatars.name}
          </div>
          <div className="flex items-center gap-2">
            {hasAllAvatars && <span className="text-[10px] text-[var(--accent-green)] tracking-wider">OWNED</span>}
            <span className="text-sm font-bold" style={{ color: STORE_ITEMS.avatars.color, fontFamily: "'Orbitron', sans-serif" }}>
              {STORE_ITEMS.avatars.price}
            </span>
          </div>
        </div>
        <div className="text-[10px] text-[var(--text-muted)] mb-4">{STORE_ITEMS.avatars.description}</div>
        {/* Avatar previews */}
        <div className="flex gap-4 mb-4 justify-center">
          {PREMIUM_AVATAR_IDS.map((id) => {
            const owned = (player?.unlockedAvatars ?? []).includes(id);
            return (
              <div key={id} className="flex flex-col items-center gap-1">
                <div
                  className={`w-16 h-16 rounded overflow-hidden border ${owned ? "border-[var(--accent-green)]" : "border-[var(--border-color)]"}`}
                  style={{ boxShadow: owned ? "0 0 8px rgba(0,255,102,0.3)" : undefined }}
                  dangerouslySetInnerHTML={{ __html: AVATARS[id].svg }}
                />
                <span className="text-[9px] text-[var(--text-muted)] tracking-wider">{AVATARS[id].label.toUpperCase()}</span>
                {owned && <span className="text-[8px] text-[var(--accent-green)]">OWNED</span>}
              </div>
            );
          })}
        </div>
        {!hasAllAvatars && (
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-2 text-xs tracking-widest border rounded text-center transition-colors no-underline cursor-pointer"
            style={{
              borderColor: STORE_ITEMS.avatars.color,
              color: STORE_ITEMS.avatars.color,
              fontFamily: "'Orbitron', sans-serif",
              backgroundColor: "transparent",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,0,51,0.1)")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            BUY AVATAR PACK
          </a>
        )}
      </div>

      {/* Title Pack */}
      <div className="hacker-card mb-4" style={{ borderColor: "rgba(153,0,255,0.4)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs tracking-wider" style={{ color: STORE_ITEMS.titles.color, fontFamily: "'Orbitron', sans-serif" }}>
            {STORE_ITEMS.titles.name}
          </div>
          <div className="flex items-center gap-2">
            {hasAllTitles && <span className="text-[10px] text-[var(--accent-green)] tracking-wider">OWNED</span>}
            <span className="text-sm font-bold" style={{ color: STORE_ITEMS.titles.color, fontFamily: "'Orbitron', sans-serif" }}>
              {STORE_ITEMS.titles.price}
            </span>
          </div>
        </div>
        <div className="text-[10px] text-[var(--text-muted)] mb-4">{STORE_ITEMS.titles.description}</div>
        {/* Title previews */}
        <div className="flex flex-col gap-2 mb-4 items-center">
          {PREMIUM_TITLES.map((t) => {
            const owned = (player?.unlockedTitles ?? []).includes(t.id);
            const cls = getTitleClass(t.id);
            return (
              <div key={t.id} className="flex items-center gap-3">
                <span
                  className={`text-sm tracking-wider ${cls ?? ""}`}
                  style={!cls ? { color: "#9900ff", fontFamily: "'Orbitron', sans-serif" } : undefined}
                >
                  {t.label}
                </span>
                {owned && <span className="text-[8px] text-[var(--accent-green)] tracking-wider">OWNED</span>}
              </div>
            );
          })}
        </div>
        {!hasAllTitles && (
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-2 text-xs tracking-widest border rounded text-center transition-colors no-underline cursor-pointer"
            style={{
              borderColor: STORE_ITEMS.titles.color,
              color: STORE_ITEMS.titles.color,
              fontFamily: "'Orbitron', sans-serif",
              backgroundColor: "transparent",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(153,0,255,0.1)")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            BUY TITLE PACK
          </a>
        )}
      </div>

      {/* Ultimate Bundle */}
      <div className="hacker-card mb-6" style={{ borderColor: "rgba(255,215,0,0.4)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs tracking-wider" style={{ color: STORE_ITEMS.bundle.color, fontFamily: "'Orbitron', sans-serif" }}>
            {STORE_ITEMS.bundle.name}
          </div>
          <div className="flex items-center gap-2">
            {hasAllAvatars && hasAllTitles && <span className="text-[10px] text-[var(--accent-green)] tracking-wider">OWNED</span>}
            <span className="text-[10px] text-[var(--text-muted)] line-through mr-1">{STORE_ITEMS.bundle.priceOriginal}</span>
            <span className="text-sm font-bold" style={{ color: STORE_ITEMS.bundle.color, fontFamily: "'Orbitron', sans-serif" }}>
              {STORE_ITEMS.bundle.price}
            </span>
          </div>
        </div>
        <div className="text-[10px] text-[var(--text-muted)] mb-4">{STORE_ITEMS.bundle.description}</div>
        {/* Combined preview */}
        <div className="flex gap-4 mb-3 justify-center">
          {PREMIUM_AVATAR_IDS.map((id) => (
            <div
              key={id}
              className="w-12 h-12 rounded overflow-hidden border border-[var(--border-color)]"
              dangerouslySetInnerHTML={{ __html: AVATARS[id].svg }}
            />
          ))}
        </div>
        <div className="flex flex-col gap-1 mb-4 items-center">
          {PREMIUM_TITLES.map((t) => {
            const cls = getTitleClass(t.id);
            return (
              <span
                key={t.id}
                className={`text-xs tracking-wider ${cls ?? ""}`}
                style={!cls ? { color: "#ffd700", fontFamily: "'Orbitron', sans-serif" } : undefined}
              >
                {t.label}
              </span>
            );
          })}
        </div>
        {!(hasAllAvatars && hasAllTitles) && (
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 text-xs tracking-widest border-2 rounded text-center transition-colors no-underline cursor-pointer font-bold"
            style={{
              borderColor: STORE_ITEMS.bundle.color,
              color: STORE_ITEMS.bundle.color,
              fontFamily: "'Orbitron', sans-serif",
              backgroundColor: "transparent",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,215,0,0.1)")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            BUY ULTIMATE BUNDLE — SAVE $1
          </a>
        )}
      </div>

      {/* Redeem Section */}
      {player && <RedeemSection player={player} setPlayer={setPlayer} />}

      {/* Info */}
      <div className="text-center">
        <div className="text-[10px] text-[var(--text-muted)] tracking-wider leading-relaxed">
          ALL PURCHASES ARE COSMETIC ONLY — NO GAMEPLAY ADVANTAGE
        </div>
        <div className="text-[10px] text-[var(--text-muted)] tracking-wider mt-1">
          AFTER PURCHASE, YOU&apos;LL RECEIVE A CODE TO REDEEM ABOVE
        </div>
      </div>
    </div>
  );
}
