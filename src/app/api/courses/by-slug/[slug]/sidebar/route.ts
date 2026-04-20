import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = createServiceClient();

  const { data: course } = await supabase
    .from("courses")
    .select(
      `
      id, title, slug, accent_color,
      course_chapters(
        id, title, "order",
        chapter_videos(id),
        chapter_notebooks(id),
        chapter_papers(id)
      )
    `
    )
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!course) {
    return NextResponse.json(null, { status: 404 });
  }

  const chapters = (course.course_chapters ?? [])
    .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
    .map(
      (ch: {
        id: string;
        title: string;
        order: number;
        chapter_videos: unknown[];
        chapter_notebooks: unknown[];
        chapter_papers: unknown[];
      }) => ({
        id: ch.id,
        title: ch.title,
        order: ch.order,
        videoCount: ch.chapter_videos?.length ?? 0,
        notebookCount: ch.chapter_notebooks?.length ?? 0,
        paperCount: ch.chapter_papers?.length ?? 0,
      })
    );

  return NextResponse.json({
    title: course.title,
    slug: course.slug,
    accentColor: course.accent_color,
    chapters,
  });
}
