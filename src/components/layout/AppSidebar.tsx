"use client";

import { useCurriculum } from "@/context/CurriculumContext";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarChapterGroup } from "./SidebarChapterGroup";
import { SidebarFooter } from "./SidebarFooter";
import { CourseSidebar } from "./CourseSidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

function NavLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-4 py-1.5 font-source-serif text-[13px] transition-colors",
        active ? "font-semibold" : "hover:bg-[#E2DCC8]"
      )}
      style={{ color: active ? "#C0392B" : "#5C4E35" }}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}

export function AppSidebar() {
  const curriculum = useCurriculum();
  const pathname = usePathname();

  // Detect community course route: /course/{slug} or /course/{slug}/{chapterId}
  const courseMatch = pathname.match(/^\/course\/([^/]+)/);
  const courseSlug = courseMatch?.[1] ?? null;

  // Show platform curriculum on chapter/appendix/search pages (not course pages)
  const showCurriculum = /^\/(chapter|appendix|search)(\/|$)/.test(pathname);

  return (
    <aside
      style={{ background: '#EDE8D5', borderRight: '1px solid #C8B882' }}
      className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col"
    >
      <SidebarHeader />
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
        {courseSlug ? (
          <CourseSidebar slug={courseSlug} />
        ) : showCurriculum ? (
          <>
            <p className="px-4 pb-1 font-jetbrains text-[8.5px] tracking-[0.2em] uppercase" style={{ color: '#A08E6B' }}>
              Chapters
            </p>
            {curriculum.chapters.map((chapter) => (
              <SidebarChapterGroup key={chapter.id} chapter={chapter} />
            ))}
            <div className="my-2 mx-4" style={{ borderTop: '1px solid #C8B882' }} />
            <p className="px-4 pb-1 font-jetbrains text-[8.5px] tracking-[0.2em] uppercase" style={{ color: '#A08E6B' }}>
              Appendices
            </p>
            {curriculum.appendices.map((chapter) => (
              <SidebarChapterGroup key={chapter.id} chapter={chapter} />
            ))}
          </>
        ) : (
          <>
            <p className="px-4 pb-1 font-jetbrains text-[8.5px] tracking-[0.2em] uppercase" style={{ color: '#A08E6B' }}>
              Navigation
            </p>
            <NavLink href="/home" icon={BookOpen} label="Browse Courses" />
            <NavLink href="/my-courses" icon={FolderOpen} label="My Courses" />
          </>
        )}
      </nav>
      <SidebarFooter />
    </aside>
  );
}
