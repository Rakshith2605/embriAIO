"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Sun, Moon, GitBranch } from "lucide-react";

export function LandingNav() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f0e1a] shrink-0 ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
            <Image src="/favicon.svg" alt="embriAIO" width={22} height={22} className="rounded-sm" priority />
          </div>
          <span className="text-sm font-normal text-foreground tracking-tight">
            embri<span className="font-bold">AI</span>o
          </span>
        </Link>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Rakshith2605/embriAIO"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="GitHub"
          >
            <GitBranch className="h-4.5 w-4.5" />
          </a>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />
            ) : (
              <div className="h-[18px] w-[18px]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
