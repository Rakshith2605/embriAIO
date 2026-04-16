import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createServiceClient } from "@/lib/supabase";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user }) {
      // Upsert user profile into Supabase on every sign-in
      if (user.email) {
        try {
          const supabase = createServiceClient();
          await supabase.from("profiles").upsert(
            {
              email: user.email,
              name: user.name ?? null,
              image: user.image ?? null,
            },
            { onConflict: "email" }
          );
        } catch {
          // Don't block sign-in if profile sync fails
        }
      }
      return true;
    },
  },
});
