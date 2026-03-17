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
  specter: {
    label: "Specter",
    premium: true,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <!-- Deep void background -->
      <rect width="32" height="32" fill="#010810" rx="4"/>
      <rect x="5" y="5" width="22" height="22" fill="#020f1a" rx="3"/>
      <!-- Outer electric tendrils -->
      <rect x="1" y="7" width="5" height="2" fill="#00e5ff">
        <animate attributeName="width" values="4;7;4" dur="1.8s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite"/>
      </rect>
      <rect x="26" y="7" width="5" height="2" fill="#00e5ff">
        <animate attributeName="width" values="4;7;4" dur="1.8s" begin="0.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" begin="0.5s" repeatCount="indefinite"/>
        <animate attributeName="x" values="26;23;26" dur="1.8s" begin="0.5s" repeatCount="indefinite"/>
      </rect>
      <rect x="1" y="23" width="4" height="2" fill="#00e5ff">
        <animate attributeName="width" values="3;6;3" dur="1.6s" begin="0.9s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.6s" begin="0.9s" repeatCount="indefinite"/>
      </rect>
      <rect x="27" y="23" width="4" height="2" fill="#00e5ff">
        <animate attributeName="width" values="3;6;3" dur="1.6s" begin="1.4s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.6s" begin="1.4s" repeatCount="indefinite"/>
        <animate attributeName="x" values="27;24;27" dur="1.6s" begin="1.4s" repeatCount="indefinite"/>
      </rect>
      <!-- Spectral face -->
      <rect x="7" y="6" width="18" height="20" fill="#031520" rx="3"/>
      <rect x="7" y="6" width="18" height="20" fill="#00e5ff" rx="3">
        <animate attributeName="opacity" values="0.04;0.12;0.04" dur="2.5s" repeatCount="indefinite"/>
      </rect>
      <!-- Brow ridge -->
      <rect x="7" y="6" width="18" height="3" fill="#052a3a" rx="2"/>
      <!-- Left eye socket -->
      <rect x="9" y="12" width="6" height="4" fill="#010f18" rx="1"/>
      <rect x="10" y="13" width="4" height="2" fill="#00e5ff">
        <animate attributeName="fill" values="#00e5ff;#88ffff;#00aacc;#00e5ff" dur="2.2s" repeatCount="indefinite"/>
      </rect>
      <rect x="10" y="13" width="1" height="1" fill="#ffffff" opacity="0.9"/>
      <rect x="9" y="12" width="6" height="4" fill="#00e5ff" rx="1">
        <animate attributeName="opacity" values="0.08;0.28;0.08" dur="2.2s" repeatCount="indefinite"/>
      </rect>
      <!-- Right eye socket -->
      <rect x="17" y="12" width="6" height="4" fill="#010f18" rx="1"/>
      <rect x="18" y="13" width="4" height="2" fill="#00e5ff">
        <animate attributeName="fill" values="#00e5ff;#88ffff;#00aacc;#00e5ff" dur="2.2s" begin="0.55s" repeatCount="indefinite"/>
      </rect>
      <rect x="18" y="13" width="1" height="1" fill="#ffffff" opacity="0.9"/>
      <rect x="17" y="12" width="6" height="4" fill="#00e5ff" rx="1">
        <animate attributeName="opacity" values="0.08;0.28;0.08" dur="2.2s" begin="0.55s" repeatCount="indefinite"/>
      </rect>
      <!-- Spectral mouth — glitch lines -->
      <rect x="10" y="20" width="12" height="1" fill="#00e5ff">
        <animate attributeName="opacity" values="0.3;0.85;0.3" dur="1.5s" repeatCount="indefinite"/>
      </rect>
      <rect x="11" y="22" width="5" height="1" fill="#00e5ff">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.8s" begin="0.3s" repeatCount="indefinite"/>
      </rect>
      <rect x="16" y="22" width="4" height="1" fill="#00e5ff">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.8s" begin="0.6s" repeatCount="indefinite"/>
      </rect>
      <!-- Energy trail bottom -->
      <rect x="13" y="25" width="6" height="4" fill="#00e5ff">
        <animate attributeName="height" values="2;5;2" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.1;0.35;0.1" dur="2s" repeatCount="indefinite"/>
      </rect>
      <!-- Floating energy particles -->
      <rect x="4" y="10" width="1" height="1" fill="#00e5ff">
        <animate attributeName="opacity" values="0;1;0" dur="2.1s" repeatCount="indefinite"/>
        <animate attributeName="y" values="10;4;10" dur="2.1s" repeatCount="indefinite"/>
      </rect>
      <rect x="27" y="12" width="1" height="1" fill="#00ccff">
        <animate attributeName="opacity" values="0;0.9;0" dur="1.8s" begin="0.7s" repeatCount="indefinite"/>
        <animate attributeName="y" values="14;7;14" dur="1.8s" begin="0.7s" repeatCount="indefinite"/>
      </rect>
      <rect x="5" y="22" width="1" height="1" fill="#00e5ff">
        <animate attributeName="opacity" values="0;0.8;0" dur="2.4s" begin="1.3s" repeatCount="indefinite"/>
        <animate attributeName="y" values="24;18;24" dur="2.4s" begin="1.3s" repeatCount="indefinite"/>
      </rect>
      <rect x="26" y="19" width="1" height="1" fill="#00ffee">
        <animate attributeName="opacity" values="0;0.7;0" dur="1.6s" begin="0.4s" repeatCount="indefinite"/>
        <animate attributeName="y" values="20;14;20" dur="1.6s" begin="0.4s" repeatCount="indefinite"/>
      </rect>
    </svg>`,
  },
  nova: {
    label: "Nova",
    premium: true,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <!-- Deep space background -->
      <rect width="32" height="32" fill="#020010" rx="4"/>
      <rect x="5" y="5" width="22" height="22" fill="#080020" rx="3"/>
      <!-- Nebula face -->
      <rect x="7" y="6" width="18" height="20" fill="#100030" rx="3"/>
      <rect x="7" y="6" width="18" height="20" fill="#8800ff" rx="3">
        <animate attributeName="opacity" values="0.05;0.13;0.05" dur="3s" repeatCount="indefinite"/>
      </rect>
      <!-- Forehead star — pulsing -->
      <rect x="14" y="7" width="4" height="4" fill="#cc88ff">
        <animate attributeName="fill" values="#cc88ff;#ffffff;#8800ff;#cc88ff" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite"/>
      </rect>
      <rect x="15" y="8" width="2" height="2" fill="#ffffff">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1s" repeatCount="indefinite"/>
      </rect>
      <rect x="13" y="8" width="2" height="1" fill="#aa66ff">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite"/>
      </rect>
      <rect x="17" y="8" width="2" height="1" fill="#aa66ff">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" begin="0.5s" repeatCount="indefinite"/>
      </rect>
      <!-- Left eye — nebula iris -->
      <rect x="9" y="13" width="5" height="4" fill="#080018" rx="1"/>
      <rect x="10" y="14" width="3" height="2" fill="#8800ff">
        <animate attributeName="fill" values="#8800ff;#cc44ff;#4400aa;#8800ff" dur="2.5s" repeatCount="indefinite"/>
      </rect>
      <rect x="11" y="14" width="1" height="1" fill="#ffffff" opacity="0.8"/>
      <rect x="9" y="13" width="5" height="4" fill="#8800ff" rx="1">
        <animate attributeName="opacity" values="0.1;0.32;0.1" dur="2.5s" repeatCount="indefinite"/>
      </rect>
      <!-- Right eye — nebula iris -->
      <rect x="18" y="13" width="5" height="4" fill="#080018" rx="1"/>
      <rect x="19" y="14" width="3" height="2" fill="#8800ff">
        <animate attributeName="fill" values="#8800ff;#cc44ff;#4400aa;#8800ff" dur="2.5s" begin="0.6s" repeatCount="indefinite"/>
      </rect>
      <rect x="19" y="14" width="1" height="1" fill="#ffffff" opacity="0.8"/>
      <rect x="18" y="13" width="5" height="4" fill="#8800ff" rx="1">
        <animate attributeName="opacity" values="0.1;0.32;0.1" dur="2.5s" begin="0.6s" repeatCount="indefinite"/>
      </rect>
      <!-- Cosmic rift mouth -->
      <rect x="11" y="20" width="10" height="2" fill="#060015" rx="1"/>
      <rect x="12" y="20" width="8" height="1" fill="#6600cc">
        <animate attributeName="opacity" values="0.3;0.75;0.3" dur="2s" repeatCount="indefinite"/>
      </rect>
      <!-- Orbital ring segments -->
      <rect x="1" y="14" width="5" height="2" fill="#6600cc">
        <animate attributeName="opacity" values="0.2;0.65;0.2" dur="3s" repeatCount="indefinite"/>
      </rect>
      <rect x="26" y="14" width="5" height="2" fill="#6600cc">
        <animate attributeName="opacity" values="0.2;0.65;0.2" dur="3s" begin="1.5s" repeatCount="indefinite"/>
      </rect>
      <rect x="14" y="1" width="4" height="3" fill="#6600cc">
        <animate attributeName="opacity" values="0.1;0.55;0.1" dur="3s" begin="0.75s" repeatCount="indefinite"/>
      </rect>
      <rect x="14" y="28" width="4" height="3" fill="#6600cc">
        <animate attributeName="opacity" values="0.1;0.55;0.1" dur="3s" begin="2.25s" repeatCount="indefinite"/>
      </rect>
      <!-- Star particles -->
      <rect x="3" y="8" width="1" height="1" fill="#cc88ff">
        <animate attributeName="opacity" values="0;0.9;0" dur="2.5s" repeatCount="indefinite"/>
        <animate attributeName="y" values="10;4;10" dur="2.5s" repeatCount="indefinite"/>
      </rect>
      <rect x="28" y="10" width="1" height="1" fill="#aa66ff">
        <animate attributeName="opacity" values="0;0.8;0" dur="2.1s" begin="0.5s" repeatCount="indefinite"/>
        <animate attributeName="y" values="12;6;12" dur="2.1s" begin="0.5s" repeatCount="indefinite"/>
      </rect>
      <rect x="4" y="20" width="1" height="1" fill="#8800ff">
        <animate attributeName="opacity" values="0;1;0" dur="1.9s" begin="1s" repeatCount="indefinite"/>
        <animate attributeName="y" values="22;16;22" dur="1.9s" begin="1s" repeatCount="indefinite"/>
      </rect>
      <rect x="27" y="22" width="1" height="1" fill="#cc44ff">
        <animate attributeName="opacity" values="0;0.9;0" dur="2.3s" begin="1.6s" repeatCount="indefinite"/>
        <animate attributeName="y" values="24;18;24" dur="2.3s" begin="1.6s" repeatCount="indefinite"/>
      </rect>
      <rect x="7" y="3" width="1" height="1" fill="#8844ff">
        <animate attributeName="opacity" values="0;0.6;0" dur="2.2s" begin="0.2s" repeatCount="indefinite"/>
      </rect>
      <rect x="24" y="4" width="1" height="1" fill="#cc88ff">
        <animate attributeName="opacity" values="0;0.7;0" dur="1.8s" begin="1.4s" repeatCount="indefinite"/>
      </rect>
    </svg>`,
  },
  void: {
    label: "Void",
    premium: true,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="#111" rx="4"/>
      <!-- outer ring -->
      <rect x="6" y="6" width="20" height="20" fill="#0a0020" rx="10"/>
      <rect x="8" y="4" width="16" height="2" fill="#7700cc">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
      </rect>
      <rect x="8" y="26" width="16" height="2" fill="#7700cc">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin="0.5s" repeatCount="indefinite"/>
      </rect>
      <rect x="4" y="8" width="2" height="16" fill="#7700cc">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin="1s" repeatCount="indefinite"/>
      </rect>
      <rect x="26" y="8" width="2" height="16" fill="#7700cc">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin="1.5s" repeatCount="indefinite"/>
      </rect>
      <!-- void center -->
      <rect x="10" y="10" width="12" height="12" fill="#050010" rx="6"/>
      <!-- swirl effect -->
      <rect x="12" y="12" width="8" height="2" fill="#9900ff">
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3s" repeatCount="indefinite"/>
      </rect>
      <rect x="18" y="14" width="2" height="6" fill="#9900ff">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" begin="0.75s" repeatCount="indefinite"/>
      </rect>
      <rect x="12" y="18" width="8" height="2" fill="#9900ff">
        <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" begin="1.5s" repeatCount="indefinite"/>
      </rect>
      <rect x="12" y="14" width="2" height="4" fill="#9900ff">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" begin="2.25s" repeatCount="indefinite"/>
      </rect>
      <!-- eye-like core -->
      <rect x="14" y="14" width="4" height="4" fill="#cc44ff">
        <animate attributeName="fill" values="#cc44ff;#ff66ff;#cc44ff" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite"/>
      </rect>
      <rect x="15" y="15" width="2" height="2" fill="#fff">
        <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1.5s" repeatCount="indefinite"/>
      </rect>
      <!-- particles -->
      <rect x="5" y="5" width="2" height="2" fill="#9900ff">
        <animate attributeName="opacity" values="0;0.8;0" dur="2.5s" repeatCount="indefinite"/>
      </rect>
      <rect x="25" y="7" width="2" height="2" fill="#cc44ff">
        <animate attributeName="opacity" values="0;0.7;0" dur="2.5s" begin="0.6s" repeatCount="indefinite"/>
      </rect>
      <rect x="7" y="25" width="2" height="2" fill="#cc44ff">
        <animate attributeName="opacity" values="0;0.7;0" dur="2.5s" begin="1.2s" repeatCount="indefinite"/>
      </rect>
      <rect x="24" y="24" width="2" height="2" fill="#9900ff">
        <animate attributeName="opacity" values="0;0.8;0" dur="2.5s" begin="1.8s" repeatCount="indefinite"/>
      </rect>
      <rect x="3" y="15" width="1" height="1" fill="#9900ff">
        <animate attributeName="opacity" values="0;0.9;0" dur="1.8s" begin="0.3s" repeatCount="indefinite"/>
      </rect>
      <rect x="28" y="16" width="1" height="1" fill="#9900ff">
        <animate attributeName="opacity" values="0;0.9;0" dur="1.8s" begin="0.9s" repeatCount="indefinite"/>
      </rect>
    </svg>`,
  },
  // ── Battle Pass Avatars ─────────────────────────────────────────────────
  samurai: {
    label: "Samurai",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="#111" rx="4"/>
      <!-- helmet -->
      <rect x="4" y="2" width="24" height="2" fill="#cc0022"/>
      <rect x="6" y="4" width="20" height="4" fill="#880011"/>
      <rect x="2" y="6" width="28" height="2" fill="#cc0022"/>
      <!-- face mask -->
      <rect x="8" y="10" width="16" height="10" fill="#2a2a3a"/>
      <rect x="8" y="10" width="16" height="2" fill="#444"/>
      <!-- eyes -->
      <rect x="10" y="13" width="4" height="2" fill="#ff3344"/>
      <rect x="18" y="13" width="4" height="2" fill="#ff3344"/>
      <!-- mouth guard -->
      <rect x="10" y="17" width="12" height="2" fill="#555"/>
      <rect x="12" y="17" width="2" height="2" fill="#333"/>
      <rect x="18" y="17" width="2" height="2" fill="#333"/>
      <!-- body -->
      <rect x="8" y="22" width="16" height="8" fill="#880011"/>
      <rect x="14" y="22" width="4" height="8" fill="#cc0022"/>
    </svg>`,
  },
  wizard: {
    label: "Wizard",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="#111" rx="4"/>
      <!-- hat -->
      <rect x="14" y="0" width="4" height="2" fill="#4400aa"/>
      <rect x="12" y="2" width="8" height="2" fill="#4400aa"/>
      <rect x="10" y="4" width="12" height="2" fill="#5500cc"/>
      <rect x="8" y="6" width="16" height="2" fill="#5500cc"/>
      <rect x="6" y="8" width="20" height="2" fill="#6600dd"/>
      <!-- star on hat -->
      <rect x="14" y="4" width="4" height="4" fill="#ffdd00"/>
      <!-- face -->
      <rect x="8" y="10" width="16" height="10" fill="#ccaa88"/>
      <!-- eyes -->
      <rect x="10" y="13" width="4" height="3" fill="#4400aa"/>
      <rect x="18" y="13" width="4" height="3" fill="#4400aa"/>
      <rect x="11" y="14" width="2" height="1" fill="#fff"/>
      <rect x="19" y="14" width="2" height="1" fill="#fff"/>
      <!-- beard -->
      <rect x="10" y="20" width="12" height="2" fill="#ddd"/>
      <rect x="12" y="22" width="8" height="4" fill="#ddd"/>
      <rect x="14" y="26" width="4" height="2" fill="#ccc"/>
      <!-- robe -->
      <rect x="6" y="24" width="6" height="8" fill="#5500cc"/>
      <rect x="20" y="24" width="6" height="8" fill="#5500cc"/>
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
