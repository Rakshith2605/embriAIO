import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CourseEditor } from "@/components/course/CourseEditor";

export const metadata = { title: "Create Course — embriAIo" };

export default async function CreateCoursePage() {
  const session = await auth();
  if (!session) redirect("/");

  return (
    <div>
      <div className="mb-6">
        <p
          className="font-jetbrains text-[10px] tracking-[0.22em] uppercase mb-2"
          style={{ color: "#C0392B" }}
        >
          § Create Course
        </p>
        <h1
          className="font-playfair font-bold text-[28px]"
          style={{ color: "#1C1610" }}
        >
          New Course
        </h1>
      </div>
      <CourseEditor />
    </div>
  );
}
