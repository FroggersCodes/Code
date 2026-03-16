// Pixel-art style SVG avatars for BugRacer profiles.
// Each is a 32×32 SVG string stored inline — no image files required.

export const AVATARS: Record<string, { label: string; svg: string; premium?: boolean }> = {
  ghost: {
    label: "Ghost",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="#111" rx="4"/>
      <!-- body -->
      <rect x="8" y="4" width="16" height="4" fill="#ddddee"/>
      <rect x="6" y="8" width="20" height="2" fill="#ddddee"/>
      <rect x="4" y="10" width="24" height="12" fill="#ddddee"/>
      <!-- wavy bottom -->
      <rect x="4" y="22" width="4" height="6" fill="#ddddee"/>
      <rect x="12" y="22" width="4" height="6" fill="#ddddee"/>
      <rect x="20" y="22" width="4" height="6" fill="#ddddee"/>
      <rect x="8" y="24" width="4" height="4" fill="#111"/>
      <rect x="16" y="24" width="4" height="4" fill="#111"/>
      <rect x="24" y="24" width="4" height="4" fill="#111"/>
      <!-- eyes -->
      <rect x="9" y="13" width="4" height="4" fill="#ff0033"/>
      <rect x="19" y="13" width="4" height="4" fill="#ff0033"/>
      <rect x="10" y="14" width="2" height="2" fill="#ff6688"/>
    </svg>`,
  },
  robot: {
    label: "Robot",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="#111" rx="4"/>
      <!-- antenna -->
      <rect x="15" y="2" width="2" height="4" fill="#00d4ff"/>
      <rect x="13" y="2" width="6" height="2" fill="#00d4ff"/>
      <!-- head -->
      <rect x="6" y="6" width="20" height="18" fill="#1a3a4a" rx="2"/>
      <rect x="6" y="6" width="20" height="2" fill="#00d4ff"/>
      <!-- visor -->
      <rect x="8" y="10" width="16" height="6" fill="#001a2a" rx="1"/>
      <rect x="9" y="11" width="6" height="4" fill="#00d4ff" opacity="0.8"/>
      <rect x="17" y="11" width="6" height="4" fill="#00d4ff" opacity="0.8"/>
      <!-- mouth -->
      <rect x="10" y="19" width="2" height="2" fill="#00d4ff"/>
      <rect x="14" y="19" width="2" height="2" fill="#00d4ff"/>
      <rect x="18" y="19" width="2" height="2" fill="#00d4ff"/>
      <!-- neck -->
      <rect x="13" y="24" width="6" height="4" fill="#1a3a4a"/>
    </svg>`,
  },
  skull: {
    label: "Skull",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="#111" rx="4"/>
      <!-- cranium -->
      <rect x="8" y="4" width="16" height="2" fill="#e0e0e0"/>
      <rect x="6" y="6" width="20" height="2" fill="#e0e0e0"/>
      <rect x="4" y="8" width="24" height="10" fill="#e0e0e0"/>
      <rect x="6" y="18" width="20" height="4" fill="#e0e0e0"/>
      <!-- eye sockets -->
      <rect x="7" y="11" width="6" height="5" fill="#111"/>
      <rect x="19" y="11" width="6" height="5" fill="#111"/>
      <!-- nose -->
      <rect x="14" y="16" width="4" height="2" fill="#111"/>
      <!-- jaw -->
      <rect x="8" y="22" width="16" height="2" fill="#e0e0e0"/>
      <!-- teeth -->
      <rect x="9" y="24" width="3" height="3" fill="#e0e0e0"/>
      <rect x="13" y="24" width="3" height="3" fill="#e0e0e0"/>
      <rect x="17" y="24" width="3" height="3" fill="#e0e0e0"/>
      <rect x="21" y="24" width="3" height="3" fill="#e0e0e0"/>
    </svg>`,
  },
  alien: {
    label: "Alien",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="#111" rx="4"/>
      <!-- head -->
      <rect x="10" y="4" width="12" height="2" fill="#44ee88"/>
      <rect x="8" y="6" width="16" height="2" fill="#44ee88"/>
      <rect x="6" y="8" width="20" height="12" fill="#44ee88"/>
      <rect x="8" y="20" width="16" height="4" fill="#44ee88"/>
      <rect x="10" y="24" width="12" height="2" fill="#44ee88"/>
      <!-- eyes -->
      <rect x="7" y="10" width="8" height="6" fill="#000" rx="1"/>
      <rect x="17" y="10" width="8" height="6" fill="#000" rx="1"/>
      <rect x="9" y="12" width="4" height="2" fill="#00ff66" opacity="0.9"/>
      <rect x="19" y="12" width="4" height="2" fill="#00ff66" opacity="0.9"/>
      <!-- mouth -->
      <rect x="12" y="21" width="8" height="1" fill="#33aa66"/>
      <!-- antennae -->
      <rect x="10" y="2" width="2" height="4" fill="#44ee88"/>
      <rect x="20" y="2" width="2" height="4" fill="#44ee88"/>
      <rect x="9" y="2" width="4" height="2" fill="#44ee88"/>
      <rect x="19" y="2" width="4" height="2" fill="#44ee88"/>
    </svg>`,
  },
  ninja: {
    label: "Ninja",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="#111" rx="4"/>
      <!-- head -->
      <rect x="8" y="6" width="16" height="18" fill="#222" rx="2"/>
      <!-- headband -->
      <rect x="6" y="10" width="20" height="4" fill="#cc0022"/>
      <rect x="6" y="10" width="2" height="2" fill="#ff3355"/>
      <!-- eyes visible in mask gap -->
      <rect x="9" y="14" width="4" height="3" fill="#fff" opacity="0.9"/>
      <rect x="19" y="14" width="4" height="3" fill="#fff" opacity="0.9"/>
      <rect x="10" y="15" width="2" height="2" fill="#333"/>
      <rect x="20" y="15" width="2" height="2" fill="#333"/>
      <!-- mask bottom -->
      <rect x="8" y="17" width="16" height="7" fill="#333"/>
      <!-- cloth wrap lines -->
      <rect x="9" y="18" width="14" height="1" fill="#222"/>
      <rect x="9" y="20" width="14" height="1" fill="#222"/>
      <rect x="9" y="22" width="14" height="1" fill="#222"/>
    </svg>`,
  },
  frog: {
    label: "Frog",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="#111" rx="4"/>
      <!-- eye bumps -->
      <rect x="7" y="5" width="6" height="6" fill="#33bb44" rx="3"/>
      <rect x="19" y="5" width="6" height="6" fill="#33bb44" rx="3"/>
      <!-- eye pupils -->
      <rect x="9" y="7" width="3" height="3" fill="#111"/>
      <rect x="21" y="7" width="3" height="3" fill="#111"/>
      <rect x="10" y="8" width="1" height="1" fill="#fff"/>
      <rect x="22" y="8" width="1" height="1" fill="#fff"/>
      <!-- head/body -->
      <rect x="6" y="9" width="20" height="14" fill="#33bb44" rx="2"/>
      <!-- belly -->
      <rect x="9" y="13" width="14" height="8" fill="#88ee99" rx="2"/>
      <!-- nostrils -->
      <rect x="13" y="11" width="2" height="1" fill="#228833"/>
      <rect x="17" y="11" width="2" height="1" fill="#228833"/>
      <!-- smile -->
      <rect x="10" y="19" width="12" height="2" fill="#228833"/>
      <rect x="10" y="19" width="2" height="4" fill="#228833"/>
      <rect x="20" y="19" width="2" height="4" fill="#228833"/>
      <!-- legs hint -->
      <rect x="4" y="21" width="6" height="4" fill="#33bb44" rx="1"/>
      <rect x="22" y="21" width="6" height="4" fill="#33bb44" rx="1"/>
    </svg>`,
  },
  glitch: {
    label: "Glitch",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="#111" rx="4"/>
      <!-- base face -->
      <rect x="6" y="6" width="20" height="20" fill="#1a0a1a"/>
      <!-- glitch stripes -->
      <rect x="4" y="8" width="24" height="2" fill="#ff0033" opacity="0.8"/>
      <rect x="2" y="14" width="28" height="2" fill="#00d4ff" opacity="0.7"/>
      <rect x="6" y="20" width="22" height="2" fill="#ff0033" opacity="0.6"/>
      <!-- displaced face pixels -->
      <rect x="8" y="11" width="4" height="4" fill="#ff0033"/>
      <rect x="21" y="11" width="4" height="4" fill="#ff0033"/>
      <!-- glitched eye -->
      <rect x="6" y="10" width="4" height="4" fill="#ff6688" opacity="0.5"/>
      <rect x="22" y="12" width="4" height="2" fill="#00d4ff" opacity="0.5"/>
      <!-- mouth distorted -->
      <rect x="9" y="20" width="14" height="2" fill="#ff0033"/>
      <rect x="7" y="21" width="4" height="2" fill="#00d4ff"/>
      <rect x="21" y="20" width="4" height="2" fill="#00d4ff"/>
      <!-- scan line artifacts -->
      <rect x="0" y="16" width="6" height="1" fill="#b700ff" opacity="0.8"/>
      <rect x="26" y="18" width="6" height="1" fill="#ff0033" opacity="0.8"/>
    </svg>`,
  },
  pixel: {
    label: "Pixel",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="#111" rx="4"/>
      <!-- face -->
      <rect x="8" y="6" width="16" height="2" fill="#ffd700"/>
      <rect x="6" y="8" width="20" height="16" fill="#ffd700"/>
      <rect x="8" y="24" width="16" height="2" fill="#ffd700"/>
      <!-- eyes -->
      <rect x="10" y="12" width="4" height="4" fill="#111"/>
      <rect x="18" y="12" width="4" height="4" fill="#111"/>
      <rect x="11" y="13" width="2" height="2" fill="#fff" opacity="0.6"/>
      <rect x="19" y="13" width="2" height="2" fill="#fff" opacity="0.6"/>
      <!-- smile -->
      <rect x="10" y="20" width="2" height="2" fill="#111"/>
      <rect x="12" y="22" width="8" height="2" fill="#111"/>
      <rect x="20" y="20" width="2" height="2" fill="#111"/>
    </svg>`,
  },
  cyborg: {
    label: "Cyborg",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="#111" rx="4"/>
      <!-- left half (human) -->
      <rect x="6" y="6" width="10" height="20" fill="#d4a080" rx="2"/>
      <!-- right half (machine) -->
      <rect x="16" y="6" width="10" height="20" fill="#334455" rx="2"/>
      <!-- center divide -->
      <rect x="15" y="6" width="2" height="20" fill="#00d4ff" opacity="0.8"/>
      <!-- human eye -->
      <rect x="8" y="12" width="4" height="4" fill="#fff"/>
      <rect x="9" y="13" width="2" height="2" fill="#442200"/>
      <!-- cyber eye -->
      <rect x="20" y="11" width="5" height="5" fill="#001a2a"/>
      <rect x="21" y="12" width="3" height="3" fill="#ff0033"/>
      <rect x="22" y="12" width="1" height="1" fill="#ff8888"/>
      <!-- circuit lines on cyber side -->
      <rect x="17" y="17" width="8" height="1" fill="#00d4ff" opacity="0.5"/>
      <rect x="19" y="17" width="1" height="4" fill="#00d4ff" opacity="0.5"/>
      <rect x="23" y="17" width="1" height="3" fill="#00d4ff" opacity="0.5"/>
      <!-- human smile half -->
      <rect x="8" y="20" width="6" height="2" fill="#c07060"/>
      <!-- cyber mouth half -->
      <rect x="17" y="20" width="7" height="2" fill="#334455"/>
      <rect x="18" y="21" width="2" height="1" fill="#00d4ff" opacity="0.6"/>
      <rect x="21" y="21" width="2" height="1" fill="#00d4ff" opacity="0.6"/>
    </svg>`,
  },
  byte: {
    label: "Byte",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="#111" rx="4"/>
      <!-- outer ring -->
      <rect x="4" y="4" width="24" height="24" fill="#1a0a2e" rx="3"/>
      <rect x="4" y="4" width="24" height="2" fill="#b700ff"/>
      <rect x="4" y="26" width="24" height="2" fill="#b700ff"/>
      <rect x="4" y="4" width="2" height="24" fill="#b700ff"/>
      <rect x="26" y="4" width="2" height="24" fill="#b700ff"/>
      <!-- binary grid 4x4 = 1 byte face -->
      <!-- row 1: 0 1 1 0 -->
      <rect x="8" y="9" width="4" height="4" fill="#1a0a2e" rx="1"/>
      <rect x="13" y="9" width="4" height="4" fill="#b700ff" rx="1"/>
      <rect x="18" y="9" width="4" height="4" fill="#b700ff" rx="1"/>
      <rect x="23" y="9" width="4" height="4" fill="#1a0a2e" rx="1"/>
      <!-- row 2: 1 0 0 1 -->
      <rect x="8" y="14" width="4" height="4" fill="#b700ff" rx="1"/>
      <rect x="13" y="14" width="4" height="4" fill="#1a0a2e" rx="1"/>
      <rect x="18" y="14" width="4" height="4" fill="#1a0a2e" rx="1"/>
      <rect x="23" y="14" width="4" height="4" fill="#b700ff" rx="1"/>
      <!-- row 3 (smile): 1 1 1 1 -->
      <rect x="8" y="19" width="4" height="4" fill="#b700ff" rx="1"/>
      <rect x="13" y="19" width="4" height="4" fill="#b700ff" rx="1"/>
      <rect x="18" y="19" width="4" height="4" fill="#b700ff" rx="1"/>
      <rect x="23" y="19" width="4" height="4" fill="#b700ff" rx="1"/>
    </svg>`,
  },
  dragon: {
    label: "Dragon",
    premium: true,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="#111" rx="4"/>
      <!-- head -->
      <rect x="6" y="8" width="20" height="14" fill="#cc2200" rx="2"/>
      <rect x="8" y="6" width="16" height="4" fill="#cc2200"/>
      <!-- horns -->
      <rect x="6" y="2" width="4" height="6" fill="#ff6600"/>
      <rect x="22" y="2" width="4" height="6" fill="#ff6600"/>
      <rect x="5" y="2" width="2" height="2" fill="#ffaa00"/>
      <rect x="24" y="2" width="2" height="2" fill="#ffaa00"/>
      <!-- eyes -->
      <rect x="8" y="11" width="6" height="4" fill="#ffdd00"/>
      <rect x="18" y="11" width="6" height="4" fill="#ffdd00"/>
      <rect x="11" y="12" width="3" height="3" fill="#111"/>
      <rect x="21" y="12" width="3" height="3" fill="#111"/>
      <rect x="12" y="12" width="1" height="1" fill="#ff6600"/>
      <rect x="22" y="12" width="1" height="1" fill="#ff6600"/>
      <!-- nostrils with fire -->
      <rect x="11" y="17" width="3" height="2" fill="#111"/>
      <rect x="18" y="17" width="3" height="2" fill="#111"/>
      <!-- jaw -->
      <rect x="8" y="22" width="16" height="4" fill="#aa1a00"/>
      <!-- teeth -->
      <rect x="9" y="22" width="2" height="2" fill="#eee"/>
      <rect x="13" y="22" width="2" height="2" fill="#eee"/>
      <rect x="17" y="22" width="2" height="2" fill="#eee"/>
      <rect x="21" y="22" width="2" height="2" fill="#eee"/>
      <!-- fire glow -->
      <rect x="12" y="26" width="2" height="4" fill="#ff6600" opacity="0.7"/>
      <rect x="18" y="26" width="2" height="4" fill="#ff6600" opacity="0.7"/>
      <rect x="15" y="27" width="2" height="3" fill="#ffaa00" opacity="0.5"/>
    </svg>`,
  },
  phoenix: {
    label: "Phoenix",
    premium: true,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="#111" rx="4"/>
      <!-- flame crest -->
      <rect x="14" y="1" width="4" height="3" fill="#ffaa00"/>
      <rect x="12" y="3" width="8" height="2" fill="#ff6600"/>
      <rect x="10" y="4" width="12" height="2" fill="#ff4400"/>
      <!-- head -->
      <rect x="10" y="6" width="12" height="10" fill="#ff6600"/>
      <rect x="8" y="8" width="16" height="8" fill="#ff4400"/>
      <!-- eyes -->
      <rect x="10" y="10" width="4" height="4" fill="#ffdd00"/>
      <rect x="18" y="10" width="4" height="4" fill="#ffdd00"/>
      <rect x="11" y="11" width="2" height="2" fill="#111"/>
      <rect x="19" y="11" width="2" height="2" fill="#111"/>
      <!-- beak -->
      <rect x="13" y="15" width="6" height="3" fill="#ffaa00"/>
      <rect x="14" y="18" width="4" height="1" fill="#ff8800"/>
      <!-- wings -->
      <rect x="2" y="14" width="8" height="2" fill="#ff4400"/>
      <rect x="22" y="14" width="8" height="2" fill="#ff4400"/>
      <rect x="4" y="16" width="6" height="2" fill="#ff6600" opacity="0.8"/>
      <rect x="22" y="16" width="6" height="2" fill="#ff6600" opacity="0.8"/>
      <rect x="3" y="12" width="5" height="2" fill="#ffaa00" opacity="0.6"/>
      <rect x="24" y="12" width="5" height="2" fill="#ffaa00" opacity="0.6"/>
      <!-- tail feathers -->
      <rect x="12" y="20" width="8" height="2" fill="#ff4400"/>
      <rect x="10" y="22" width="12" height="2" fill="#ff6600" opacity="0.8"/>
      <rect x="8" y="24" width="16" height="2" fill="#ffaa00" opacity="0.6"/>
      <rect x="11" y="26" width="4" height="3" fill="#ff4400" opacity="0.5"/>
      <rect x="17" y="26" width="4" height="3" fill="#ff4400" opacity="0.5"/>
      <rect x="14" y="27" width="4" height="3" fill="#ffaa00" opacity="0.4"/>
    </svg>`,
  },
  void: {
    label: "Void",
    premium: true,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="#111" rx="4"/>
      <!-- outer ring -->
      <rect x="6" y="6" width="20" height="20" fill="#0a0020" rx="10"/>
      <rect x="8" y="4" width="16" height="2" fill="#7700cc" opacity="0.6"/>
      <rect x="8" y="26" width="16" height="2" fill="#7700cc" opacity="0.6"/>
      <rect x="4" y="8" width="2" height="16" fill="#7700cc" opacity="0.6"/>
      <rect x="26" y="8" width="2" height="16" fill="#7700cc" opacity="0.6"/>
      <!-- void center -->
      <rect x="10" y="10" width="12" height="12" fill="#050010" rx="6"/>
      <!-- swirl effect -->
      <rect x="12" y="12" width="8" height="2" fill="#9900ff" opacity="0.5"/>
      <rect x="18" y="14" width="2" height="6" fill="#9900ff" opacity="0.4"/>
      <rect x="12" y="18" width="8" height="2" fill="#9900ff" opacity="0.3"/>
      <rect x="12" y="14" width="2" height="4" fill="#9900ff" opacity="0.4"/>
      <!-- eye-like core -->
      <rect x="14" y="14" width="4" height="4" fill="#cc44ff" opacity="0.8"/>
      <rect x="15" y="15" width="2" height="2" fill="#fff" opacity="0.9"/>
      <!-- particles -->
      <rect x="5" y="5" width="2" height="2" fill="#9900ff" opacity="0.5"/>
      <rect x="25" y="7" width="2" height="2" fill="#cc44ff" opacity="0.4"/>
      <rect x="7" y="25" width="2" height="2" fill="#cc44ff" opacity="0.4"/>
      <rect x="24" y="24" width="2" height="2" fill="#9900ff" opacity="0.5"/>
      <rect x="3" y="15" width="1" height="1" fill="#9900ff" opacity="0.6"/>
      <rect x="28" y="16" width="1" height="1" fill="#9900ff" opacity="0.6"/>
    </svg>`,
  },
};

export function getAvatarSvg(id: string | null | undefined): string | null {
  if (!id) return null;
  return AVATARS[id]?.svg ?? null;
}

export const AVATAR_IDS = Object.keys(AVATARS);

export function isPremiumAvatar(id: string): boolean {
  return AVATARS[id]?.premium === true;
}

export const PREMIUM_AVATAR_IDS = AVATAR_IDS.filter((id) => AVATARS[id]?.premium);
