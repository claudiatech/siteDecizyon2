import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (pathname.startsWith("/app")) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    if (token.systemRole === "SUPPORT") {
      const url = req.nextUrl.clone();
      url.pathname = "/support";
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/support")) {
    if (!token || token.systemRole !== "SUPPORT") {
      const url = req.nextUrl.clone();
      url.pathname = token ? "/app/dashboard" : "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/support/:path*"]
};
