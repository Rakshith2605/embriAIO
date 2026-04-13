"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Search, Sun, Moon, ChevronRight, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { SearchDialog } from "@/components/search/SearchDialog";
import { ALL_CHAPTERS } from "@/lib/curriculum";
import { cn } from "@/lib/utils";

interface Props {
  onMobileMenuToggle: () => void;
  mobileMenuOpen: boolean;
}

function buildBreadcrumb(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [{ label: "Home", href: "/" }];

  if (parts[0] === "chapter" || parts[0] === "appendix") {
    const chapterId = parts[1];
    const chapter = ALL_CHAPTERS.find((c) => c.id === chapterId);
    if (chapter) {
      const href = `/${parts[0]}/${chapterId}`;
      crumbs.push({ label: `${chapter.title}: ${chapter.subtitle}`, href });

      if (parts[2] === "notebook" && parts[3]) {
        const nb = chapter.mainNotebooks.find((n) => n.slug === parts[3]);
        if (nb) crumbs.push({ label: nb.title, href: `${href}/notebook/${nb.slug}` });
      }
    }
  } else if (parts[0] === "search") {
    crumbs.push({ label: "Search", href: "/search" });
  }

  return crumbs;
}

export function TopBar({ onMobileMenuToggle, mobileMenuOpen }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);
  const crumbs = buildBreadcrumb(pathname);

  useKeyboardShortcut("k", () => setSearchOpen(true));

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/95 backdrop-blur px-4">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <nav className="flex-1 flex items-center gap-1 text-sm overflow-hidden" aria-label="Breadcrumb">
          {crumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1 min-w-0">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
              {i === crumbs.length - 1 ? (
                <span className="text-foreground font-medium truncate">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        <button
          onClick={() => setSearchOpen(true)}
          className={cn(
            "flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground",
            "hover:border-ring hover:text-foreground transition-colors",
            "hidden sm:flex"
          )}
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search</span>
          <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] sm:flex">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={() => setSearchOpen(true)}
          className="sm:hidden text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>

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
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
