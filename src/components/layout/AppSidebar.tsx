"use client";

import { CURRICULUM } from "@/lib/curriculum";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarChapterGroup } from "./SidebarChapterGroup";
import { SidebarFooter } from "./SidebarFooter";

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <SidebarHeader />
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
        <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          Chapters
        </p>
        {CURRICULUM.chapters.map((chapter) => (
          <SidebarChapterGroup key={chapter.id} chapter={chapter} />
        ))}
        <div className="my-2 mx-4 border-t border-sidebar-border" />
        <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          Appendices
        </p>
        {CURRICULUM.appendices.map((chapter) => (
          <SidebarChapterGroup key={chapter.id} chapter={chapter} />
        ))}
      </nav>
      <SidebarFooter />
    </aside>
  );
}
