import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SignInPage } from "@/components/landing/SignInPage";
import { fetchCourses } from "@/lib/db-curriculum";

export const metadata = {
  title: "embriAIo — Sign In",
  description:
    "Learn AI from First Principles. Hands-on courses with real notebooks, video walkthroughs, and progress tracking.",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  const session = await auth();
  if (session) {
    redirect(searchParams.callbackUrl ?? "/home");
  }
  const courses = await fetchCourses();
  return <SignInPage callbackUrl={searchParams.callbackUrl} courses={courses} />;
}
