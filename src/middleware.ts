import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname, origin } = req.nextUrl;

  if (pathname.startsWith("/chapter") && !isLoggedIn) {
    const signInUrl = new URL("/", origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/chapter/:path*"],
};
