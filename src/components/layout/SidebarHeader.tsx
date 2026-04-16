import Link from "next/link";
import Image from "next/image";

export function SidebarHeader() {
  return (
    <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid #C8B882' }}>
      <div className="shrink-0">
        <Image
          src="/favicon.svg"
          alt="EmrAIO"
          width={28}
          height={28}
          className="rounded-sm"
          priority
        />
      </div>
      <div className="min-w-0">
        <Link href="/home" className="block">
          <p className="font-playfair font-bold text-[14px] leading-tight truncate" style={{ color: '#1C1610' }}>
            emrAIo
          </p>
          <p className="font-jetbrains text-[9px] tracking-[0.12em] uppercase truncate" style={{ color: '#8B7355' }}>
            Open-Source AI Education
          </p>
        </Link>
      </div>
    </div>
  );
}
