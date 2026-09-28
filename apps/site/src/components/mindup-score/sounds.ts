let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  return ctx;
}

async function runningCtx(): Promise<AudioContext | null> {
  try {
    const c = getCtx();
    if (c.state === "suspended") await c.resume();
    return c.state === "running" ? c : null;
  } catch {
    return null;
  }
}

/** Call inside a user gesture (Start / answer tap) to unlock audio on mobile */
export function unlockAudio() {
  try {
    const c = getCtx();
    if (c.state === "suspended") void c.resume();
  } catch {}
}

/** Short tick — used for last-3-second countdown */
export function playTick() {
  void runningCtx().then((c) => {
    if (!c) return;
    try {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
      osc.connect(gain).connect(c.destination);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + 0.08);
    } catch {}
  });
}

/** Soft select blip — played on every manual answer tap */
export function playSelect() {
  void runningCtx().then((c) => {
    if (!c) return;
    try {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sine";
      osc.frequency.value = 620;
      gain.gain.setValueAtTime(0.12, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.09);
      osc.connect(gain).connect(c.destination);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + 0.09);
    } catch {}
  });
}

/** XP ding — two-note confirm when pillar XP is awarded */
export function playXp() {
  void runningCtx().then((c) => {
    if (!c) return;
    try {
      const notes = [660, 880];
      notes.forEach((freq, i) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const start = c.currentTime + i * 0.09;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.14, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
        osc.connect(gain).connect(c.destination);
        osc.start(start);
        osc.stop(start + 0.22);
      });
    } catch {}
  });
}

/** Winner chime — 3-note ascending arpeggio */
export function playWin() {
  void runningCtx().then((c) => {
    if (!c) return;
    try {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, i) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const start = c.currentTime + i * 0.15;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.18, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.connect(gain).connect(c.destination);
        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch {}
  });
}

/** Timeout buzzer — two-tone alarm, harsh and attention-grabbing */
export function playSiren() {
  void runningCtx().then((c) => {
    if (!c) return;
    try {
      // First tone: high beep
      const osc1 = c.createOscillator();
      const g1 = c.createGain();
      osc1.type = "square";
      osc1.frequency.value = 880;
      g1.gain.setValueAtTime(0.15, c.currentTime);
      g1.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
      osc1.connect(g1).connect(c.destination);
      osc1.start(c.currentTime);
      osc1.stop(c.currentTime + 0.15);
      // Second tone: lower buzz
      const osc2 = c.createOscillator();
      const g2 = c.createGain();
      osc2.type = "square";
      osc2.frequency.value = 440;
      g2.gain.setValueAtTime(0, c.currentTime + 0.15);
      g2.gain.linearRampToValueAtTime(0.18, c.currentTime + 0.18);
      g2.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.45);
      osc2.connect(g2).connect(c.destination);
      osc2.start(c.currentTime + 0.15);
      osc2.stop(c.currentTime + 0.45);
    } catch {}
  });
}
