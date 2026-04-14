"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Search, Menu, X } from "lucide-react";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { SearchDialog } from "@/components/search/SearchDialog";
import { UserMenu } from "@/components/auth/UserMenu";
import { ALL_CHAPTERS } from "@/lib/curriculum";

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
  const pathname = usePathname();

  const crumbs = buildBreadcrumb(pathname);

  useKeyboardShortcut("k", () => setSearchOpen(true));

  return (
    <>
      <header
        className="sticky top-0 z-40 flex h-14 items-center gap-3 px-4"
        style={{ background: '#F7F2E7', borderBottom: '1px solid #C8B882' }}
      >
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden transition-colors"
          style={{ color: '#8B7355' }}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <nav className="flex-1 flex items-center gap-1 overflow-hidden" aria-label="Breadcrumb">
          {crumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1 min-w-0">
              {i > 0 && (
                <span className="font-jetbrains text-[10px] shrink-0" style={{ color: '#C8B882' }}>›</span>
              )}
              {i === crumbs.length - 1 ? (
                <span className="font-jetbrains text-[10px] font-medium truncate" style={{ color: '#1C1610' }}>
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="font-jetbrains text-[10px] shrink-0 transition-colors"
                  style={{ color: '#8B7355' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#1C1610'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#8B7355'; }}
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        {/* User menu */}
        <UserMenu />

        {/* Search button — desktop */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 font-jetbrains text-[10px] transition-colors"
          style={{ border: '1px solid #C8B882', color: '#8B7355' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = '#C0392B';
            (e.currentTarget as HTMLElement).style.color = '#C0392B';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = '#C8B882';
            (e.currentTarget as HTMLElement).style.color = '#8B7355';
          }}
        >
          <Search className="h-3.5 w-3.5" style={{ color: '#A08E6B' }} />
          <span>Search</span>
          <kbd
            className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 px-1.5 font-jetbrains text-[10px] sm:flex"
            style={{ border: '1px solid #C8B882', color: '#A08E6B' }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Search button — mobile */}
        <button
          onClick={() => setSearchOpen(true)}
          className="sm:hidden transition-colors"
          style={{ color: '#8B7355' }}
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
