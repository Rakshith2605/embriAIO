import { fetchCurriculum } from "@/lib/db-curriculum";
import { LearnLayoutClient } from "@/components/layout/LearnLayoutClient";

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const curriculum = await fetchCurriculum();

  return (
    <LearnLayoutClient curriculum={curriculum}>
      {children}
    </LearnLayoutClient>
  );
}
