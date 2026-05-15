"use client";

import { useEffect, useState } from "react";
import { getSoundOn, setSoundOn } from "@/lib/sound-prefs";

export default function SoundToggle() {
  const [on, setOn] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setOn(getSoundOn());
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9" aria-hidden />;
  }

  const toggle = () => {
    const next = !on;
    setOn(next);
    setSoundOn(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={on ? "Mute clink sound" : "Enable clink sound"}
      aria-pressed={on}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-cream-warm)] text-base transition active:scale-95"
      title={on ? "Sound on" : "Sound off"}
    >
      <span aria-hidden>{on ? "🔔" : "🔕"}</span>
    </button>
  );
}
