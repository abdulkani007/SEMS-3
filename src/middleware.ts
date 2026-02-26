import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  
  if (pathname.startsWith("/admin")) {
    if (!token || (token as any).role !== "admin") {
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      signInUrl.searchParams.set("mode", "admin");
      return NextResponse.redirect(signInUrl);
    }
  }

  
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/profile")) {
    if (!token) {
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      signInUrl.searchParams.set("mode", "student");
      return NextResponse.redirect(signInUrl);
    }
    // Redirect admin users to admin dashboard (except for profile page)
    if ((token as any).role === "admin" && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/profile/:path*"],
};






