import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SignInPage } from "@/components/landing/SignInPage";

export const metadata = {
  title: "embriAIo — Sign In",
  description:
    "Learn AI from First Principles. Hands-on courses with real notebooks, video walkthroughs, and progress tracking.",
};

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/chapter/ch01");
  return <SignInPage />;
}
