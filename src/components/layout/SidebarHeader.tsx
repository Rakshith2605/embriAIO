import Link from "next/link";
import Image from "next/image";

export function SidebarHeader() {
  return (
    <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f0e1a] shrink-0">
        <Image
          src="/favicon.svg"
          alt="EmbriAIO"
          width={28}
          height={28}
          className="rounded-sm"
          priority
        />
      </div>
      <div className="min-w-0">
        <Link href="/" className="block">
          <p className="text-sm font-semibold text-sidebar-foreground leading-tight truncate">
            LLMs from Scratch
          </p>
          <p className="text-xs text-sidebar-foreground/60 truncate">
            Sebastian Raschka
          </p>
        </Link>
      </div>
    </div>
  );
}
