"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch by mounting the component on the client
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder structure of same dimensions to preserve layout size
    return (
      <div className="size-9 rounded-xl border border-border/40 bg-muted/20" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center justify-center size-9 rounded-xl border border-border bg-card/40 hover:bg-muted text-foreground transition-all duration-200 cursor-pointer active:scale-95 shadow-md hover:shadow-lg focus:outline-none"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      type="button"
    >
      {isDark ? (
        <Sun className="size-4.5 text-amber-400 hover:text-amber-300 transition-colors animate-fade-in" />
      ) : (
        <Moon className="size-4.5 text-zinc-700 hover:text-zinc-900 transition-colors animate-fade-in" />
      )}
    </button>
  );
}
