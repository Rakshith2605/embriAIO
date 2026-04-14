"use client";

import { CURRICULUM } from "@/lib/curriculum";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarChapterGroup } from "./SidebarChapterGroup";
import { SidebarFooter } from "./SidebarFooter";

export function AppSidebar() {
  return (
    <aside
      style={{ background: '#EDE8D5', borderRight: '1px solid #C8B882' }}
      className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col"
    >
      <SidebarHeader />
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
        <p className="px-4 pb-1 font-jetbrains text-[8.5px] tracking-[0.2em] uppercase" style={{ color: '#A08E6B' }}>
          Chapters
        </p>
        {CURRICULUM.chapters.map((chapter) => (
          <SidebarChapterGroup key={chapter.id} chapter={chapter} />
        ))}
        <div className="my-2 mx-4" style={{ borderTop: '1px solid #C8B882' }} />
        <p className="px-4 pb-1 font-jetbrains text-[8.5px] tracking-[0.2em] uppercase" style={{ color: '#A08E6B' }}>
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
