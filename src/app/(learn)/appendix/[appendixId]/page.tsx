import { redirect, notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AppendixPage({ params }: { params: { appendixId: string } }) {
  const supabase = createServiceClient();
  const slug = params.appendixId;

  // Look up the chapter by slug and find the course slug
  const { data: chapter } = await supabase
    .from("course_chapters")
    .select("id, courses!inner(slug)")
    .eq("slug", slug)
    .single();

  if (!chapter) {
    // Also try matching by UUID directly
    const { data: chapterById } = await supabase
      .from("course_chapters")
      .select("id, courses!inner(slug)")
      .eq("id", slug)
      .single();

    if (!chapterById) notFound();

    const courseSlug = (chapterById as unknown as { courses: { slug: string } }).courses.slug;
    redirect(`/course/${courseSlug}/${chapterById.id}`);
  }

  const courseSlug = (chapter as unknown as { courses: { slug: string } }).courses.slug;
  redirect(`/course/${courseSlug}/${chapter.id}`);
}
