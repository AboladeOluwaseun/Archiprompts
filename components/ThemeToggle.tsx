"use client";

import { useEffect, useState } from "react";
import { Theme, applyTheme, getStoredTheme } from "@/lib/theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  const setAndApply = (next: Theme) => {
    setTheme(next);
    applyTheme(next);
  };

  return (
    <div className="theme-toggle" role="group" aria-label="Theme">
      <button
        type="button"
        className={`theme-toggle-btn${theme === "dark" ? " active" : ""}`}
        onClick={() => setAndApply("dark")}
      >
        Dark
      </button>
      <button
        type="button"
        className={`theme-toggle-btn${theme === "light" ? " active" : ""}`}
        onClick={() => setAndApply("light")}
      >
        Light
      </button>
    </div>
  );
}
