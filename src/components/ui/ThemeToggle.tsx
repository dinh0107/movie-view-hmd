"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-9" aria-label="Theme">
        <Sun className="size-4 opacity-0" />
      </Button>
    );
  }

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-9 text-muted-foreground hover:text-primary"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Bật chế độ sáng" : "Bật chế độ tối"}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
