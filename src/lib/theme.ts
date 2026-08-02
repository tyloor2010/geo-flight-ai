import { useEffect } from "react";
import { create } from "zustand";

export type ThemeMode = "dark" | "light";

const KEY = "droneroute-theme";

function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.classList.toggle("dark", mode === "dark");
  el.classList.toggle("light", mode === "light");
  el.style.colorScheme = mode;
}

type ThemeState = {
  mode: ThemeMode;
  hydrated: boolean;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
  hydrate: () => void;
};

export const useTheme = create<ThemeState>((set, get) => ({
  mode: "dark",
  hydrated: false,
  setMode: (mode) => {
    applyTheme(mode);
    try {
      localStorage.setItem(KEY, mode);
    } catch {
      /* storage unavailable */
    }
    set({ mode });
  },
  toggle: () => get().setMode(get().mode === "dark" ? "light" : "dark"),
  hydrate: () => {
    if (get().hydrated) return;
    let stored: ThemeMode = "dark";
    try {
      const v = localStorage.getItem(KEY);
      if (v === "light" || v === "dark") stored = v;
    } catch {
      /* storage unavailable */
    }
    applyTheme(stored);
    set({ mode: stored, hydrated: true });
  },
}));

/** Applies the persisted theme after hydration (avoids SSR mismatch). */
export function useThemeSync() {
  const hydrate = useTheme((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
}
