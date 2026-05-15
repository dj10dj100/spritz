"use client";

const KEY = "spritzulator.soundOn";

export function getSoundOn(): boolean {
  if (typeof window === "undefined") return true;
  const v = window.localStorage.getItem(KEY);
  return v === null ? true : v === "1";
}

export function setSoundOn(on: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, on ? "1" : "0");
  window.dispatchEvent(new CustomEvent("spritzulator:sound", { detail: on }));
}
