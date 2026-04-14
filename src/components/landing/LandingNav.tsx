import Link from "next/link";
import { UserMenu } from "@/components/auth/UserMenu";

export function LandingNav() {
  return (
    <header
      style={{ background: '#F7F2E7', borderBottom: '1px solid #C8B882' }}
      className="sticky top-0 z-50"
    >
      <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center" aria-label="embriAIo home">
          <span className="font-playfair font-bold text-[18px] text-pg-ink">
            embri<span className="font-bold uppercase">AI</span>o
          </span>
        </Link>

        {/* Right nav links */}
        <nav className="flex items-center gap-6">
          <Link
            href="/chapter/ch01"
            className="font-jetbrains text-[11px] tracking-[0.12em] uppercase text-pg-muted hover:text-pg-rust transition-colors"
          >
            Courses
          </Link>
          <a
            href="https://github.com/Rakshith2605/embriAIO"
            target="_blank"
            rel="noopener noreferrer"
            className="font-jetbrains text-[11px] tracking-[0.12em] uppercase text-pg-muted hover:text-pg-rust transition-colors"
          >
            Github
          </a>
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
