"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CompletionStatus } from "@/types/curriculum";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface Props {
  href: string;
  label: string;
  status: CompletionStatus;
}

const statusIcons = {
  completed:   <CheckCircle2 className="h-3 w-3 shrink-0" style={{ color: '#C0392B' }} />,
  in_progress: <Clock        className="h-3 w-3 shrink-0" style={{ color: '#C0392B' }} />,
  not_started: <Circle       className="h-3 w-3 shrink-0" style={{ color: '#A08E6B' }} />,
};

export function SidebarNotebookItem({ href, label, status }: Props) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className="flex items-center gap-2 py-1 pl-8 pr-4 transition-colors font-jetbrains text-[9px]"
      style={{
        background: isActive ? 'rgba(192,57,43,0.06)' : 'transparent',
        color: isActive ? '#C0392B' : '#5C4E35',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.background = 'rgba(192,57,43,0.04)';
          (e.currentTarget as HTMLElement).style.color = '#C0392B';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
          (e.currentTarget as HTMLElement).style.color = '#5C4E35';
        }
      }}
    >
      {statusIcons[status]}
      <span className="truncate">{label}</span>
    </Link>
  );
}
