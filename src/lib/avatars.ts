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
      <!-- Deep dark background with blood-red underglow -->
      <rect width="32" height="32" fill="#080100" rx="4"/>
      <rect x="5" y="5" width="22" height="22" fill="#150000" rx="3"/>
      <!-- Armored scale rows -->
      <rect x="6" y="7" width="9" height="3" fill="#aa1200" rx="1"/>
      <rect x="17" y="7" width="9" height="3" fill="#aa1200" rx="1"/>
      <rect x="15" y="7" width="1" height="3" fill="#6a0a00"/>
      <rect x="6" y="11" width="6" height="3" fill="#991100" rx="1"/>
      <rect x="14" y="11" width="5" height="3" fill="#991100" rx="1"/>
      <rect x="21" y="11" width="5" height="3" fill="#991100" rx="1"/>
      <rect x="12" y="11" width="1" height="3" fill="#6a0a00"/>
      <rect x="19" y="11" width="1" height="3" fill="#6a0a00"/>
      <!-- Main head body (over scales) -->
      <rect x="5" y="8" width="22" height="16" fill="#8c0e00" rx="2"/>
      <!-- Brow ridge -->
      <rect x="5" y="8" width="22" height="3" fill="#aa1400" rx="2"/>
      <!-- Left horn -->
      <rect x="4" y="0" width="4" height="9" fill="#bb1600" rx="1"/>
      <rect x="2" y="0" width="4" height="7" fill="#dd2200"/>
      <!-- Left horn tip glow -->
      <rect x="2" y="0" width="3" height="2" fill="#ffaa00">
        <animate attributeName="fill" values="#ffaa00;#ff4400;#ffdd00;#ffaa00" dur="1.2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.7;1;0.7" dur="0.8s" repeatCount="indefinite"/>
      </rect>
      <!-- Right horn -->
      <rect x="24" y="0" width="4" height="9" fill="#bb1600" rx="1"/>
      <rect x="26" y="0" width="4" height="7" fill="#dd2200"/>
      <!-- Right horn tip glow -->
      <rect x="27" y="0" width="3" height="2" fill="#ffaa00">
        <animate attributeName="fill" values="#ffaa00;#ff4400;#ffdd00;#ffaa00" dur="1.2s" begin="0.6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.7;1;0.7" dur="0.8s" begin="0.6s" repeatCount="indefinite"/>
      </rect>
      <!-- Eye sockets (deep void) -->
      <rect x="7" y="12" width="7" height="5" fill="#100000" rx="1"/>
      <rect x="18" y="12" width="7" height="5" fill="#100000" rx="1"/>
      <!-- Eye glow halos -->
      <rect x="7" y="12" width="7" height="5" fill="#ff4400" rx="1">
        <animate attributeName="opacity" values="0.08;0.22;0.08" dur="1.6s" repeatCount="indefinite"/>
      </rect>
      <rect x="18" y="12" width="7" height="5" fill="#ff4400" rx="1">
        <animate attributeName="opacity" values="0.08;0.22;0.08" dur="1.6s" begin="0.8s" repeatCount="indefinite"/>
      </rect>
      <!-- Left eye — lava slit pupil -->
      <rect x="9" y="14" width="4" height="2" fill="#ff5500">
        <animate attributeName="fill" values="#ff5500;#ffcc00;#ff2200;#ff5500" dur="1.8s" repeatCount="indefinite"/>
      </rect>
      <rect x="11" y="13" width="1" height="4" fill="#1a0000"/>
      <rect x="8" y="14" width="1" height="1" fill="#fff" opacity="0.6"/>
      <!-- Right eye — lava slit pupil -->
      <rect x="20" y="14" width="4" height="2" fill="#ff5500">
        <animate attributeName="fill" values="#ff5500;#ffcc00;#ff2200;#ff5500" dur="1.8s" begin="0.45s" repeatCount="indefinite"/>
      </rect>
      <rect x="22" y="13" width="1" height="4" fill="#1a0000"/>
      <rect x="19" y="14" width="1" height="1" fill="#fff" opacity="0.6"/>
      <!-- Snout -->
      <rect x="10" y="18" width="12" height="5" fill="#6e0900" rx="1"/>
      <!-- Nostrils -->
      <rect x="12" y="19" width="2" height="2" fill="#0e0000" rx="1"/>
      <rect x="18" y="19" width="2" height="2" fill="#0e0000" rx="1"/>
      <!-- Smoke from nostrils -->
      <rect x="12" y="17" width="1" height="2" fill="#ff5500">
        <animate attributeName="opacity" values="0;0.4;0" dur="1.2s" repeatCount="indefinite"/>
        <animate attributeName="y" values="18;15;18" dur="1.2s" repeatCount="indefinite"/>
      </rect>
      <rect x="19" y="17" width="1" height="2" fill="#ff5500">
        <animate attributeName="opacity" values="0;0.4;0" dur="1.4s" begin="0.6s" repeatCount="indefinite"/>
        <animate attributeName="y" values="18;15;18" dur="1.4s" begin="0.6s" repeatCount="indefinite"/>
      </rect>
      <!-- Jaw -->
      <rect x="10" y="22" width="12" height="3" fill="#5a0700"/>
      <!-- Fangs -->
      <rect x="11" y="22" width="2" height="3" fill="#ddddd8"/>
      <rect x="15" y="22" width="2" height="3" fill="#ddddd8"/>
      <rect x="19" y="22" width="2" height="3" fill="#ddddd8"/>
      <!-- Fire breath -->
      <rect x="11" y="25" width="3" height="6" fill="#ff4400" rx="1">
        <animate attributeName="height" values="5;9;5" dur="0.65s" repeatCount="indefinite"/>
        <animate attributeName="fill" values="#ff4400;#ff8800;#ff2000;#ff4400" dur="0.9s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;0.6;1" dur="0.65s" repeatCount="indefinite"/>
      </rect>
      <rect x="15" y="26" width="2" height="5" fill="#ffcc00" rx="1">
        <animate attributeName="height" values="3;7;3" dur="0.85s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;1;0.8" dur="0.85s" repeatCount="indefinite"/>
      </rect>
      <rect x="18" y="25" width="3" height="6" fill="#ff4400" rx="1">
        <animate attributeName="height" values="4;8;4" dur="0.75s" repeatCount="indefinite"/>
        <animate attributeName="fill" values="#ff5500;#ffaa00;#ff1e00;#ff5500" dur="0.75s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.9;0.5;0.9" dur="0.75s" repeatCount="indefinite"/>
      </rect>
      <!-- Floating embers -->
      <rect x="3" y="14" width="1" height="1" fill="#ff8800">
        <animate attributeName="opacity" values="0;1;0" dur="1.9s" repeatCount="indefinite"/>
        <animate attributeName="y" values="14;8;14" dur="1.9s" repeatCount="indefinite"/>
      </rect>
      <rect x="28" y="10" width="1" height="1" fill="#ffcc00">
        <animate attributeName="opacity" values="0;0.9;0" dur="1.5s" begin="0.6s" repeatCount="indefinite"/>
        <animate attributeName="y" values="12;5;12" dur="1.5s" begin="0.6s" repeatCount="indefinite"/>
      </rect>
      <rect x="16" y="4" width="1" height="1" fill="#ff6600">
        <animate attributeName="opacity" values="0;0.8;0" dur="2.2s" begin="1.1s" repeatCount="indefinite"/>
        <animate attributeName="y" values="6;1;6" dur="2.2s" begin="1.1s" repeatCount="indefinite"/>
      </rect>
    </svg>`,
  },
  phoenix: {
    label: "Phoenix",
    premium: true,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <!-- Deep dark background with golden warmth -->
      <rect width="32" height="32" fill="#070400" rx="4"/>
      <rect x="8" y="6" width="16" height="22" fill="#1a0e00" rx="5"/>
      <!-- Left wing — layered feathers -->
      <rect x="0" y="14" width="11" height="3" fill="#ff6600">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="width" values="11;13;11" dur="2s" repeatCount="indefinite"/>
      </rect>
      <rect x="0" y="12" width="8" height="3" fill="#ff8800" opacity="0.8">
        <animate attributeName="opacity" values="0.5;0.85;0.5" dur="2s" begin="0.25s" repeatCount="indefinite"/>
      </rect>
      <rect x="1" y="16" width="9" height="3" fill="#ffaa00" opacity="0.7">
        <animate attributeName="opacity" values="0.4;0.75;0.4" dur="2s" begin="0.5s" repeatCount="indefinite"/>
      </rect>
      <rect x="0" y="18" width="7" height="2" fill="#ff6600" opacity="0.5"/>
      <!-- Right wing — layered feathers -->
      <rect x="21" y="14" width="11" height="3" fill="#ff6600">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" begin="0.1s" repeatCount="indefinite"/>
        <animate attributeName="width" values="11;13;11" dur="2s" begin="0.1s" repeatCount="indefinite"/>
        <animate attributeName="x" values="21;19;21" dur="2s" begin="0.1s" repeatCount="indefinite"/>
      </rect>
      <rect x="24" y="12" width="8" height="3" fill="#ff8800" opacity="0.8">
        <animate attributeName="opacity" values="0.5;0.85;0.5" dur="2s" begin="0.35s" repeatCount="indefinite"/>
      </rect>
      <rect x="22" y="16" width="9" height="3" fill="#ffaa00" opacity="0.7">
        <animate attributeName="opacity" values="0.4;0.75;0.4" dur="2s" begin="0.6s" repeatCount="indefinite"/>
      </rect>
      <rect x="25" y="18" width="7" height="2" fill="#ff6600" opacity="0.5"/>
      <!-- Body — golden -->
      <rect x="11" y="9" width="10" height="15" fill="#ffaa00" rx="2"/>
      <rect x="12" y="8" width="8" height="16" fill="#ffcc44"/>
      <!-- Head -->
      <rect x="11" y="7" width="10" height="10" fill="#ffcc44" rx="2"/>
      <rect x="12" y="6" width="8" height="11" fill="#ffd966"/>
      <!-- White-hot center shine -->
      <rect x="14" y="8" width="4" height="6" fill="#fff8b0">
        <animate attributeName="opacity" values="0.35;0.65;0.35" dur="1.6s" repeatCount="indefinite"/>
      </rect>
      <!-- Flame crest/crown -->
      <rect x="14" y="1" width="4" height="6" fill="#ff6600" rx="1">
        <animate attributeName="height" values="5;8;5" dur="0.7s" repeatCount="indefinite"/>
        <animate attributeName="fill" values="#ff6600;#ffcc00;#ff3300;#ff6600" dur="0.9s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.9;1;0.9" dur="0.7s" repeatCount="indefinite"/>
      </rect>
      <rect x="11" y="2" width="3" height="5" fill="#ff4400" rx="1">
        <animate attributeName="height" values="4;7;4" dur="0.85s" begin="0.2s" repeatCount="indefinite"/>
        <animate attributeName="fill" values="#ff4400;#ffaa00;#ff2200;#ff4400" dur="1.05s" begin="0.2s" repeatCount="indefinite"/>
      </rect>
      <rect x="18" y="2" width="3" height="5" fill="#ff4400" rx="1">
        <animate attributeName="height" values="4;7;4" dur="0.95s" begin="0.4s" repeatCount="indefinite"/>
        <animate attributeName="fill" values="#ff4400;#ffaa00;#ff2200;#ff4400" dur="0.85s" begin="0.4s" repeatCount="indefinite"/>
      </rect>
      <!-- Eyes — burning gold irises -->
      <rect x="12" y="10" width="4" height="3" fill="#220800" rx="1"/>
      <rect x="16" y="10" width="4" height="3" fill="#220800" rx="1"/>
      <rect x="13" y="10" width="2" height="3" fill="#ffaa00">
        <animate attributeName="fill" values="#ffaa00;#ffee00;#ff8800;#ffaa00" dur="1.5s" repeatCount="indefinite"/>
      </rect>
      <rect x="17" y="10" width="2" height="3" fill="#ffaa00">
        <animate attributeName="fill" values="#ffaa00;#ffee00;#ff8800;#ffaa00" dur="1.5s" begin="0.5s" repeatCount="indefinite"/>
      </rect>
      <!-- Dark pupils -->
      <rect x="14" y="11" width="1" height="1" fill="#0a0000"/>
      <rect x="18" y="11" width="1" height="1" fill="#0a0000"/>
      <!-- Eye shine -->
      <rect x="13" y="10" width="1" height="1" fill="#fff" opacity="0.8"/>
      <rect x="17" y="10" width="1" height="1" fill="#fff" opacity="0.8"/>
      <!-- Beak -->
      <rect x="14" y="14" width="4" height="2" fill="#e09000" rx="1"/>
      <rect x="15" y="16" width="2" height="1" fill="#c07000"/>
      <!-- Tail flames -->
      <rect x="12" y="24" width="8" height="2" fill="#ff8800"/>
      <rect x="11" y="25" width="4" height="6" fill="#ff4400" rx="1">
        <animate attributeName="height" values="5;8;5" dur="0.8s" repeatCount="indefinite"/>
        <animate attributeName="fill" values="#ff4400;#ffcc00;#ff2200;#ff4400" dur="1s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.9;1;0.9" dur="0.8s" repeatCount="indefinite"/>
      </rect>
      <rect x="16" y="25" width="4" height="6" fill="#ff4400" rx="1">
        <animate attributeName="height" values="5;8;5" dur="0.9s" begin="0.3s" repeatCount="indefinite"/>
        <animate attributeName="fill" values="#ff4400;#ffcc00;#ff2200;#ff4400" dur="0.9s" begin="0.3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.85;1;0.85" dur="0.9s" begin="0.3s" repeatCount="indefinite"/>
      </rect>
      <rect x="14" y="26" width="4" height="5" fill="#ffcc00" rx="1">
        <animate attributeName="height" values="4;7;4" dur="0.7s" begin="0.15s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.7;1;0.7" dur="0.7s" begin="0.15s" repeatCount="indefinite"/>
      </rect>
      <!-- Golden sparks floating up -->
      <rect x="4" y="18" width="1" height="1" fill="#ffcc00">
        <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="y" values="18;10;18" dur="2s" repeatCount="indefinite"/>
      </rect>
      <rect x="27" y="15" width="1" height="1" fill="#ff8800">
        <animate attributeName="opacity" values="0;0.9;0" dur="1.7s" begin="0.5s" repeatCount="indefinite"/>
        <animate attributeName="y" values="16;8;16" dur="1.7s" begin="0.5s" repeatCount="indefinite"/>
      </rect>
      <rect x="8" y="20" width="1" height="1" fill="#ffaa00">
        <animate attributeName="opacity" values="0;0.85;0" dur="2.2s" begin="1.1s" repeatCount="indefinite"/>
        <animate attributeName="y" values="22;14;22" dur="2.2s" begin="1.1s" repeatCount="indefinite"/>
      </rect>
      <rect x="23" y="18" width="1" height="1" fill="#ffd700">
        <animate attributeName="opacity" values="0;0.8;0" dur="1.9s" begin="0.8s" repeatCount="indefinite"/>
        <animate attributeName="y" values="20;12;20" dur="1.9s" begin="0.8s" repeatCount="indefinite"/>
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
  demon: {
    label: "Demon",
    premium: true,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="#111" rx="4"/>
      <!-- horns -->
      <rect x="4" y="2" width="4" height="6" fill="#cc0000"/>
      <rect x="2" y="2" width="2" height="4" fill="#990000"/>
      <rect x="24" y="2" width="4" height="6" fill="#cc0000"/>
      <rect x="28" y="2" width="2" height="4" fill="#990000"/>
      <!-- head -->
      <rect x="6" y="6" width="20" height="4" fill="#cc2222"/>
      <rect x="4" y="10" width="24" height="10" fill="#cc2222"/>
      <!-- eyes -->
      <rect x="8" y="12" width="6" height="4" fill="#111"/>
      <rect x="18" y="12" width="6" height="4" fill="#111"/>
      <rect x="10" y="13" width="2" height="2" fill="#ffcc00">
        <animate attributeName="fill" values="#ffcc00;#ff3300;#ffcc00" dur="1.5s" repeatCount="indefinite"/>
      </rect>
      <rect x="20" y="13" width="2" height="2" fill="#ffcc00">
        <animate attributeName="fill" values="#ffcc00;#ff3300;#ffcc00" dur="1.5s" repeatCount="indefinite"/>
      </rect>
      <!-- mouth -->
      <rect x="10" y="18" width="12" height="2" fill="#880000"/>
      <rect x="12" y="18" width="2" height="2" fill="#fff"/>
      <rect x="18" y="18" width="2" height="2" fill="#fff"/>
      <!-- body -->
      <rect x="8" y="22" width="16" height="10" fill="#aa1111"/>
    </svg>`,
  },
  angel: {
    label: "Angel",
    premium: true,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="#111" rx="4"/>
      <!-- halo -->
      <rect x="10" y="0" width="12" height="2" fill="#ffd700">
        <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite"/>
      </rect>
      <rect x="8" y="2" width="2" height="2" fill="#ffd700"/>
      <rect x="22" y="2" width="2" height="2" fill="#ffd700"/>
      <!-- head -->
      <rect x="8" y="6" width="16" height="2" fill="#ffe0cc"/>
      <rect x="6" y="8" width="20" height="10" fill="#ffe0cc"/>
      <!-- eyes -->
      <rect x="9" y="11" width="4" height="3" fill="#4488ff"/>
      <rect x="19" y="11" width="4" height="3" fill="#4488ff"/>
      <rect x="10" y="12" width="2" height="1" fill="#fff"/>
      <rect x="20" y="12" width="2" height="1" fill="#fff"/>
      <!-- smile -->
      <rect x="12" y="15" width="8" height="1" fill="#cc8866"/>
      <!-- wings -->
      <rect x="0" y="14" width="6" height="8" fill="#eee">
        <animate attributeName="opacity" values="1;0.7;1" dur="3s" repeatCount="indefinite"/>
      </rect>
      <rect x="26" y="14" width="6" height="8" fill="#eee">
        <animate attributeName="opacity" values="1;0.7;1" dur="3s" repeatCount="indefinite"/>
      </rect>
      <!-- body/robe -->
      <rect x="8" y="20" width="16" height="10" fill="#eeeeff"/>
      <rect x="14" y="20" width="4" height="10" fill="#ddddef"/>
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
