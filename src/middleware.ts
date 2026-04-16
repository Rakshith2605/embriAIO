import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname, origin } = req.nextUrl;

  const isProtected =
    pathname.startsWith("/chapter") ||
    pathname.startsWith("/appendix") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/create") ||
    pathname.startsWith("/course") ||
    pathname.startsWith("/my-courses") ||
    pathname === "/home";

  if (isProtected && !isLoggedIn) {
    const signInUrl = new URL("/", origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: [
    "/chapter/:path*",
    "/appendix/:path*",
    "/search",
    "/home",
    "/create/:path*",
    "/course/:path*",
    "/my-courses",
  ],
};
