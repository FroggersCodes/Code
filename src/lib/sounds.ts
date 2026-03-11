"use client";

let audioCtx: AudioContext | null = null;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

export function isMuted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("bugracer_muted") === "1";
}

export function toggleMute(): boolean {
  const next = !isMuted();
  localStorage.setItem("bugracer_muted", next ? "1" : "0");
  return next;
}

function play(fn: (c: AudioContext) => void): void {
  if (isMuted()) return;
  const c = ctx();
  if (c) fn(c);
}

function tone(
  c: AudioContext,
  freq: number,
  type: OscillatorType,
  vol: number,
  startAt: number,
  duration: number
): void {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(vol, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
  osc.start(startAt);
  osc.stop(startAt + duration);
}

export function playMatchFound(): void {
  play((c) => {
    [440, 554, 659, 880].forEach((f, i) => tone(c, f, "sine", 0.18, c.currentTime + i * 0.1, 0.22));
  });
}

export function playCountdownBeep(final = false): void {
  play((c) => tone(c, final ? 1200 : 880, "square", final ? 0.1 : 0.06, c.currentTime, 0.1));
}

export function playTypingBurst(): void {
  play((c) => {
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * 0.025), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() - 0.5) * 0.6;
    const src = c.createBufferSource();
    const filt = c.createBiquadFilter();
    const gain = c.createGain();
    filt.type = "bandpass";
    filt.frequency.value = 2400;
    filt.Q.value = 0.8;
    src.buffer = buf;
    src.connect(filt);
    filt.connect(gain);
    gain.connect(c.destination);
    gain.gain.setValueAtTime(0.12, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.025);
    src.start(c.currentTime);
  });
}

export function playSolveSound(): void {
  play((c) => {
    [523, 659, 784, 1047].forEach((f, i) => tone(c, f, "sine", 0.2, c.currentTime + i * 0.08, 0.35));
  });
}

export function playWinSound(): void {
  play((c) => {
    [523, 659, 784, 659, 1047].forEach((f, i) => tone(c, f, "sine", 0.22, c.currentTime + i * 0.13, 0.4));
  });
}

export function playLoseSound(): void {
  play((c) => {
    [440, 370, 311, 262].forEach((f, i) => tone(c, f, "sine", 0.15, c.currentTime + i * 0.16, 0.4));
  });
}

export function playUnlockSound(): void {
  play((c) => {
    [523, 784, 1047, 1568].forEach((f, i) => tone(c, f, "sine", 0.25, c.currentTime + i * 0.1, 0.4));
  });
}
