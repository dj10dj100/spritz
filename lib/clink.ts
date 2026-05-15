"use client";

// Tiny Web Audio clink — two damped sine partials, ~250ms, no asset needed.

let ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

export function playClink() {
  try {
    const audio = getCtx();
    if (!audio) return;
    if (audio.state === "suspended") audio.resume().catch(() => {});
    const now = audio.currentTime;
    const partials: Array<[freq: number, gain: number, decay: number]> = [
      [1320, 0.18, 0.22],
      [880, 0.12, 0.32],
    ];
    for (const [freq, peak, decay] of partials) {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start(now);
      osc.stop(now + decay + 0.02);
    }
  } catch {
    // Silently swallow; audio failures must not affect the tap path.
  }
}
