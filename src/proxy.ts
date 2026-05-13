import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/register"];
const DOCTOR_PREFIX = "/doctor";
const ADMIN_PREFIX = "/admin";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("access_token")?.value;
  const role = req.cookies.get("user_role")?.value;

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  if (!token) {
    if (isPublic) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname === "/" || isPublic) {
    const destination = role === "ADMIN_VPRS" ? "/admin/dashboard" : "/doctor/dashboard";
    return NextResponse.redirect(new URL(destination, req.url));
  }

  if (pathname.startsWith(DOCTOR_PREFIX) && role !== "DOCTOR") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  if (pathname.startsWith(ADMIN_PREFIX) && role !== "ADMIN_VPRS") {
    return NextResponse.redirect(new URL("/doctor/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
