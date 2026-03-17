"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPlayer, savePlayer } from "@/lib/storage";
import { AVATARS, PREMIUM_AVATAR_IDS } from "@/lib/avatars";
import { PREMIUM_TITLES, getTitleClass } from "@/lib/titles";
import { BORDERS, isPremiumBorder, RARITY_COLORS } from "@/lib/borders";
import { unlockPremiumPass, getCurrentTier, getSeasonDaysLeft, getCurrentSeasonId, getSeasonName } from "@/lib/battlepass";
import type { Player } from "@/types";

// ── Store configuration ────────────────────────────────────────────────────
const STORE_ITEMS = {
  battlepass: {
    id: "battle_pass",
    name: "PREMIUM BATTLE PASS",
    description: "Unlock the premium track — exclusive avatars, animated borders, and rare titles across 30 tiers",
    price: "$4.99",
    coins: 10000,
    color: "#aa44ff",
  },
  avatars: {
    id: "avatar_pack",
    name: "AVATAR PACK",
    description: "3 exclusive animated avatars: Specter, Nova & Void",
    price: "$2.99",
    coins: 2999,
    color: "#ff0033",
  },
  titles: {
    id: "title_pack",
    name: "TITLE PACK",
    description: "3 premium animated titles: Neon Phantom, Void Walker & Cyber Dragon",
    price: "$2.99",
    coins: 2999,
    color: "#9900ff",
  },
  borders: {
    id: "border_pack",
    name: "BORDER PACK",
    description: "3 premium animated profile borders: Plasma Ring, Void Aura & Fire Ring",
    price: "$2.99",
    coins: 2999,
    color: "#00ccff",
  },
  bundle: {
    id: "ultimate_bundle",
    name: "ULTIMATE BUNDLE",
    description: "All avatars + all titles + all borders — save $3!",
    price: "$5.99",
    priceOriginal: "$8.97",
    coins: 5990,
    color: "#ffd700",
  },
} as const;

const PREMIUM_BORDER_IDS = BORDERS.filter((b) => isPremiumBorder(b.id)).map((b) => b.id);

// ── Helpers to unlock items on a player object ─────────────────────────────
function unlockAvatars(player: Player): Player {
  const current = player.unlockedAvatars ?? [];
  const toAdd = PREMIUM_AVATAR_IDS.filter((id) => !current.includes(id));
  return { ...player, unlockedAvatars: [...current, ...toAdd] };
}

function unlockTitles(player: Player): Player {
  const current = player.unlockedTitles ?? [];
  const toAdd = PREMIUM_TITLES.map((t) => t.id).filter((id) => !current.includes(id));
  return { ...player, unlockedTitles: [...current, ...toAdd] };
}

function unlockBorders(player: Player): Player {
  const current = player.unlockedBorders ?? [];
  const toAdd = PREMIUM_BORDER_IDS.filter((id) => !current.includes(id));
  return { ...player, unlockedBorders: [...current, ...toAdd] };
}

function unlockForProduct(player: Player, productId: string): Player {
  let updated = { ...player };
  if (productId === "avatar_pack" || productId === "ultimate_bundle") {
    updated = unlockAvatars(updated);
  }
  if (productId === "title_pack" || productId === "ultimate_bundle") {
    updated = unlockTitles(updated);
  }
  if (productId === "border_pack" || productId === "ultimate_bundle") {
    updated = unlockBorders(updated);
  }
  if (productId === "battle_pass") {
    updated.premiumPass = true;
  }
  return updated;
}

// ── Split buy button (half real money / half coins) ─────────────────────────
function SplitBuyButton({
  productId,
  priceLabel,
  coinCost,
  color,
  username,
  bold,
  player,
  onCoinBuy,
}: {
  productId: string;
  priceLabel: string;
  coinCost: number;
  color: string;
  username: string;
  bold?: boolean;
  player: Player | null;
  onCoinBuy: (updated: Player) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [coinLoading, setCoinLoading] = useState(false);
  const [coinSuccess, setCoinSuccess] = useState(false);

  const playerCoins = player?.coins ?? 0;
  const canAfford = playerCoins >= coinCost;

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, username }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned:", data);
        setLoading(false);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setLoading(false);
    }
  };

  const handleCoinBuy = () => {
    if (!player || !canAfford || coinLoading) return;
    setCoinLoading(true);
    const updated = unlockForProduct(
      { ...player, coins: playerCoins - coinCost },
      productId
    );
    savePlayer(updated);
    onCoinBuy(updated);
    setCoinLoading(false);
    setCoinSuccess(true);
    setTimeout(() => setCoinSuccess(false), 2500);
  };

  const py = bold ? "py-3" : "py-2";
  const borderWidth = bold ? "border-2" : "border";

  return (
    <div
      className={`flex w-full rounded overflow-hidden ${borderWidth}`}
      style={{ borderColor: color }}
    >
      {/* Left half — real money (Stripe) */}
      <button
        onClick={handleBuy}
        disabled={loading}
        className={`flex-1 ${py} text-xs tracking-widest text-center transition-colors cursor-pointer bg-transparent`}
        style={{
          color: loading ? "var(--text-muted)" : color,
          fontFamily: "'Orbitron', sans-serif",
          borderRight: `1px solid ${color}`,
        }}
        onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = `${color}1a`)}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        {loading ? "..." : priceLabel}
      </button>

      {/* Right half — coins */}
      <button
        onClick={handleCoinBuy}
        disabled={!canAfford || coinLoading}
        className={`flex-1 ${py} text-xs tracking-widest text-center transition-colors bg-transparent`}
        style={{
          color: coinSuccess ? "var(--accent-green)" : canAfford ? "#ffd700" : "#664400",
          fontFamily: "'Orbitron', sans-serif",
          cursor: canAfford ? "pointer" : "not-allowed",
          opacity: canAfford ? 1 : 0.45,
        }}
        onMouseOver={(e) => canAfford && !coinLoading && (e.currentTarget.style.backgroundColor = "rgba(255,215,0,0.08)")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        {coinSuccess ? "UNLOCKED!" : coinLoading ? "..." : `${coinCost.toLocaleString()} COINS`}
      </button>
    </div>
  );
}

// ── Redeem section (admin codes) ───────────────────────────────────────────
function RedeemSection({ player, setPlayer }: { player: Player; setPlayer: (p: Player) => void }) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleRedeem = () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    const codes = getRedeemCodes();
    const found = codes.find((c) => c.code === trimmed && !c.used);

    if (!found) {
      setStatus({ type: "error", text: "Invalid or already used code" });
      return;
    }

    const productMap: Record<string, string> = { avatars: "avatar_pack", titles: "title_pack", borders: "border_pack", bundle: "ultimate_bundle", battlepass: "battle_pass" };
    const updated = unlockForProduct(player, productMap[found.type] ?? "ultimate_bundle");
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

// ── Local code storage (for admin-generated codes) ─────────────────────────
interface RedeemCode {
  code: string;
  type: "avatars" | "titles" | "borders" | "bundle" | "battlepass";
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

// ── Main store page ────────────────────────────────────────────────────────
export default function StorePage() {
  return (
    <Suspense>
      <StoreContent />
    </Suspense>
  );
}

function StoreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);

  // Load player
  useEffect(() => {
    setPlayer(getPlayer());
  }, []);

  // Handle post-purchase redirect — verify with server and unlock
  const verifyPurchase = useCallback(async (productId: string, currentPlayer: Player) => {
    setPurchaseStatus("VERIFYING PURCHASE...");

    for (let attempt = 0; attempt < 6; attempt++) {
      try {
        const res = await fetch("/api/verify-purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: currentPlayer.username, productId }),
        });
        const data = await res.json();

        if (data.verified) {
          let updated = unlockForProduct(currentPlayer, productId);
          savePlayer(updated);
          if (productId === "battle_pass") {
            unlockPremiumPass();
            updated = getPlayer() ?? updated;
          }
          setPlayer(updated);
          setPurchaseStatus("PURCHASE VERIFIED — ITEMS UNLOCKED!");
          window.history.replaceState({}, "", "/store");
          return;
        }
      } catch {
        // ignore fetch errors, keep retrying
      }

      if (attempt < 5) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    setPurchaseStatus("COULD NOT VERIFY YET — USE A REDEEM CODE IF YOU RECEIVED ONE");
    window.history.replaceState({}, "", "/store");
  }, []);

  useEffect(() => {
    const purchased = searchParams.get("purchased");
    if (purchased && player) {
      verifyPurchase(purchased, player);
    }
  }, [searchParams, player, verifyPurchase]);

  const username = player?.username ?? "";
  const hasAllAvatars = player && PREMIUM_AVATAR_IDS.every((id) => (player.unlockedAvatars ?? []).includes(id));
  const hasAllTitles = player && PREMIUM_TITLES.every((t) => (player.unlockedTitles ?? []).includes(t.id));
  const hasAllBorders = player && PREMIUM_BORDER_IDS.every((id) => player.unlockedBorders.includes(id));
  const hasPremiumPass = player?.premiumPass;

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
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
          &larr; BACK
        </button>
      </div>

      {/* Purchase status banner */}
      {purchaseStatus && (
        <div className="hacker-card mb-4" style={{ borderColor: "rgba(0,255,102,0.4)" }}>
          <div className="text-xs text-[var(--accent-green)] tracking-wider text-center" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            {purchaseStatus}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="text-[10px] text-[var(--text-muted)] tracking-wider leading-relaxed">
          SUPPORT BUGRACER &mdash; GET EXCLUSIVE ANIMATED COSMETICS
        </div>
        {player && (
          <div className="flex items-center gap-1.5 text-xs flex-shrink-0">
            <span style={{ color: "#ffd700" }}>$</span>
            <span className="font-bold" style={{ color: "#ffd700", fontFamily: "'Orbitron', sans-serif" }}>
              {(player.coins ?? 0).toLocaleString()}
            </span>
            <span className="text-[var(--text-dim)]">coins</span>
          </div>
        )}
      </div>

      {/* ── BATTLE PASS ─────────────────────────────────────────────── */}
      <div
        className="hacker-card store-card-battlepass store-card-scan mb-4"
        style={{ borderColor: "rgba(170,68,255,0.5)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className="text-xs tracking-wider store-name-glow"
            style={{ color: STORE_ITEMS.battlepass.color, fontFamily: "'Orbitron', sans-serif" }}
          >
            {STORE_ITEMS.battlepass.name}
          </div>
          <div className="flex items-center gap-2">
            {hasPremiumPass && <span className="text-[10px] text-[var(--accent-green)] tracking-wider">OWNED</span>}
            <span className="text-[10px] text-[var(--text-muted)]">{STORE_ITEMS.battlepass.coins.toLocaleString()} coins</span>
            <span className="text-sm font-bold" style={{ color: STORE_ITEMS.battlepass.color, fontFamily: "'Orbitron', sans-serif" }}>
              {STORE_ITEMS.battlepass.price}
            </span>
          </div>
        </div>
        <div className="text-[10px] text-[var(--text-muted)] mb-3">{STORE_ITEMS.battlepass.description}</div>

        {/* Season info */}
        <div className="flex items-center justify-between text-[10px] text-[var(--text-dim)] mb-3 border-t border-b border-[var(--border-color)] py-2">
          <span>SEASON {getSeasonName().toUpperCase()}</span>
          <span>{getSeasonDaysLeft()} DAYS LEFT</span>
          {player && <span>TIER {getCurrentTier(player.xp)}/30</span>}
        </div>

        {/* Premium reward preview */}
        <div className="flex gap-2 mb-4 justify-center flex-wrap">
          {["Specter", "Nova", "Elite", "Apex Predator", "Season Victor"].map((name) => (
            <span key={name} className="text-[9px] px-2 py-1 rounded border border-[var(--border-color)] text-[var(--text-dim)]">
              {name}
            </span>
          ))}
        </div>

        {!hasPremiumPass && username && (
          <SplitBuyButton
            productId="battle_pass"
            priceLabel="UNLOCK — $4.99"
            coinCost={STORE_ITEMS.battlepass.coins}
            color={STORE_ITEMS.battlepass.color}
            username={username}
            bold
            player={player}
            onCoinBuy={setPlayer}
          />
        )}
        {hasPremiumPass && (
          <button
            onClick={() => router.push("/battlepass")}
            className="block w-full py-2 text-xs tracking-widest border rounded text-center transition-colors cursor-pointer bg-transparent"
            style={{ borderColor: "var(--accent-green)", color: "var(--accent-green)", fontFamily: "'Orbitron', sans-serif" }}
          >
            VIEW BATTLE PASS
          </button>
        )}
      </div>

      {/* ── AVATAR PACK ─────────────────────────────────────────────── */}
      <div
        className="hacker-card store-card-avatars store-card-scan mb-4"
        style={{ borderColor: "rgba(255,0,51,0.4)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className="text-xs tracking-wider store-name-glow"
            style={{ color: STORE_ITEMS.avatars.color, fontFamily: "'Orbitron', sans-serif" }}
          >
            {STORE_ITEMS.avatars.name}
          </div>
          <div className="flex items-center gap-2">
            {hasAllAvatars && <span className="text-[10px] text-[var(--accent-green)] tracking-wider">OWNED</span>}
            <span className="text-[10px] text-[var(--text-muted)]">{STORE_ITEMS.avatars.coins.toLocaleString()} coins</span>
            <span className="text-sm font-bold" style={{ color: STORE_ITEMS.avatars.color, fontFamily: "'Orbitron', sans-serif" }}>
              {STORE_ITEMS.avatars.price}
            </span>
          </div>
        </div>
        <div className="text-[10px] text-[var(--text-muted)] mb-4">{STORE_ITEMS.avatars.description}</div>
        <div className="flex gap-3 sm:gap-4 mb-4 justify-center">
          {PREMIUM_AVATAR_IDS.map((id) => {
            const owned = (player?.unlockedAvatars ?? []).includes(id);
            return (
              <div key={id} className="flex flex-col items-center gap-1">
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded overflow-hidden border store-avatar-float ${owned ? "border-[var(--accent-green)]" : "border-[var(--border-color)]"}`}
                  style={{ boxShadow: owned ? "0 0 10px rgba(0,255,102,0.35)" : "0 0 8px rgba(255,0,51,0.2)" }}
                  dangerouslySetInnerHTML={{ __html: AVATARS[id].svg }}
                />
                <span className="text-[9px] text-[var(--text-muted)] tracking-wider">{AVATARS[id].label.toUpperCase()}</span>
                {owned && <span className="text-[8px] text-[var(--accent-green)]">OWNED</span>}
              </div>
            );
          })}
        </div>
        {!hasAllAvatars && username && (
          <SplitBuyButton
            productId="avatar_pack"
            priceLabel="BUY — $2.99"
            coinCost={STORE_ITEMS.avatars.coins}
            color={STORE_ITEMS.avatars.color}
            username={username}
            player={player}
            onCoinBuy={setPlayer}
          />
        )}
      </div>

      {/* ── TITLE PACK ─────────────────────────────────────────────── */}
      <div
        className="hacker-card store-card-titles store-card-scan mb-4"
        style={{ borderColor: "rgba(153,0,255,0.4)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className="text-xs tracking-wider store-name-glow"
            style={{ color: STORE_ITEMS.titles.color, fontFamily: "'Orbitron', sans-serif" }}
          >
            {STORE_ITEMS.titles.name}
          </div>
          <div className="flex items-center gap-2">
            {hasAllTitles && <span className="text-[10px] text-[var(--accent-green)] tracking-wider">OWNED</span>}
            <span className="text-[10px] text-[var(--text-muted)]">{STORE_ITEMS.titles.coins.toLocaleString()} coins</span>
            <span className="text-sm font-bold" style={{ color: STORE_ITEMS.titles.color, fontFamily: "'Orbitron', sans-serif" }}>
              {STORE_ITEMS.titles.price}
            </span>
          </div>
        </div>
        <div className="text-[10px] text-[var(--text-muted)] mb-4">{STORE_ITEMS.titles.description}</div>
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
        {!hasAllTitles && username && (
          <SplitBuyButton
            productId="title_pack"
            priceLabel="BUY — $2.99"
            coinCost={STORE_ITEMS.titles.coins}
            color={STORE_ITEMS.titles.color}
            username={username}
            player={player}
            onCoinBuy={setPlayer}
          />
        )}
      </div>

      {/* ── BORDER PACK ─────────────────────────────────────────────── */}
      <div
        className="hacker-card store-card-borders store-card-scan mb-4"
        style={{ borderColor: "rgba(0,204,255,0.4)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className="text-xs tracking-wider store-name-glow"
            style={{ color: STORE_ITEMS.borders.color, fontFamily: "'Orbitron', sans-serif" }}
          >
            {STORE_ITEMS.borders.name}
          </div>
          <div className="flex items-center gap-2">
            {hasAllBorders && <span className="text-[10px] text-[var(--accent-green)] tracking-wider">OWNED</span>}
            <span className="text-[10px] text-[var(--text-muted)]">{STORE_ITEMS.borders.coins.toLocaleString()} coins</span>
            <span className="text-sm font-bold" style={{ color: STORE_ITEMS.borders.color, fontFamily: "'Orbitron', sans-serif" }}>
              {STORE_ITEMS.borders.price}
            </span>
          </div>
        </div>
        <div className="text-[10px] text-[var(--text-muted)] mb-4">{STORE_ITEMS.borders.description}</div>
        <div className="flex gap-3 mb-4 justify-center flex-wrap">
          {BORDERS.filter((b) => b.rarity === "premium").slice(0, 3).map((b) => {
            const owned = player?.unlockedBorders.includes(b.id);
            return (
              <div key={b.id} className="flex flex-col items-center gap-1">
                <div
                  className={`w-12 h-12 rounded border-2 ${b.cssClass} flex items-center justify-center store-avatar-float ${owned ? "" : "opacity-50"}`}
                  style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
                >
                  <span className="text-[8px]" style={{ color: RARITY_COLORS[b.rarity] }}>{b.rarity === "legendary" ? "L" : "P"}</span>
                </div>
                <span className="text-[9px] text-[var(--text-muted)] tracking-wider">{b.name.toUpperCase()}</span>
                {owned && <span className="text-[8px] text-[var(--accent-green)]">OWNED</span>}
              </div>
            );
          })}
        </div>
        {!hasAllBorders && username && (
          <SplitBuyButton
            productId="border_pack"
            priceLabel="BUY — $2.99"
            coinCost={STORE_ITEMS.borders.coins}
            color={STORE_ITEMS.borders.color}
            username={username}
            player={player}
            onCoinBuy={setPlayer}
          />
        )}
      </div>

      {/* ── ULTIMATE BUNDLE ─────────────────────────────────────────── */}
      <div
        className="hacker-card store-card-bundle store-card-scan mb-6"
        style={{ borderColor: "rgba(255,215,0,0.4)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className="text-xs tracking-wider store-name-glow"
            style={{ color: STORE_ITEMS.bundle.color, fontFamily: "'Orbitron', sans-serif" }}
          >
            {STORE_ITEMS.bundle.name}
          </div>
          <div className="flex items-center gap-2">
            {hasAllAvatars && hasAllTitles && hasAllBorders && <span className="text-[10px] text-[var(--accent-green)] tracking-wider">OWNED</span>}
            <span className="text-[10px] text-[var(--text-muted)]">{STORE_ITEMS.bundle.coins.toLocaleString()} coins</span>
            <span className="text-[10px] text-[var(--text-muted)] line-through mr-1">{STORE_ITEMS.bundle.priceOriginal}</span>
            <span className="text-sm font-bold" style={{ color: STORE_ITEMS.bundle.color, fontFamily: "'Orbitron', sans-serif" }}>
              {STORE_ITEMS.bundle.price}
            </span>
          </div>
        </div>
        <div className="text-[10px] text-[var(--text-muted)] mb-4">{STORE_ITEMS.bundle.description}</div>
        <div className="flex gap-4 mb-3 justify-center">
          {PREMIUM_AVATAR_IDS.map((id) => (
            <div
              key={id}
              className="w-12 h-12 rounded overflow-hidden border border-[var(--border-color)] store-avatar-float"
              style={{ boxShadow: "0 0 8px rgba(255,215,0,0.2)" }}
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
        {!(hasAllAvatars && hasAllTitles && hasAllBorders) && username && (
          <SplitBuyButton
            productId="ultimate_bundle"
            priceLabel="BUNDLE — $5.99"
            coinCost={STORE_ITEMS.bundle.coins}
            color={STORE_ITEMS.bundle.color}
            username={username}
            bold
            player={player}
            onCoinBuy={setPlayer}
          />
        )}
      </div>

      {/* Redeem Section */}
      {player && <RedeemSection player={player} setPlayer={setPlayer} />}

      {/* Info */}
      <div className="text-center">
        <div className="text-[10px] text-[var(--text-muted)] tracking-wider leading-relaxed">
          ALL PURCHASES ARE COSMETIC ONLY &mdash; NO GAMEPLAY ADVANTAGE
        </div>
        <div className="text-[10px] text-[var(--text-muted)] tracking-wider mt-1">
          ITEMS UNLOCK AUTOMATICALLY AFTER PURCHASE. USE REDEEM CODE AS BACKUP.
        </div>
      </div>
    </div>
  );
}
