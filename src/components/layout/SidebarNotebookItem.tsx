"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CompletionStatus } from "@/types/curriculum";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface Props {
  href: string;
  label: string;
  status: CompletionStatus;
}

const statusIcons = {
  completed: <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />,
  in_progress: <Clock className="h-3.5 w-3.5 text-yellow-400 shrink-0" />,
  not_started: <Circle className="h-3.5 w-3.5 text-sidebar-foreground/30 shrink-0" />,
};

export function SidebarNotebookItem({ href, label, status }: Props) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-3 py-1.5 text-xs transition-colors group",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      {statusIcons[status]}
      <span className="truncate">{label}</span>
    </Link>
  );
}
