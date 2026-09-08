import { type NextRequest, NextResponse } from "next/server";

const ROOT_DOMAIN = "website.com";
const ADMIN_SUBDOMAIN = "admin";

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const hostname = host.split(":")[0]; // strip port for local dev

  const subdomain = getSubdomain(hostname);
  const { pathname } = req.nextUrl;

  // Admin subdomain: rewrite everything into /admin/*
  if (subdomain === ADMIN_SUBDOMAIN) {
    if (!pathname.startsWith("/admin")) {
      return NextResponse.rewrite(new URL(`/admin${pathname}`, req.url));
    }
    return NextResponse.next();
  }

  // Main domain / any other host: block direct access to /admin/*
  if (pathname.startsWith("/admin")) {
    return NextResponse.rewrite(new URL("/404", req.url));
  }

  return NextResponse.next();
}

function getSubdomain(hostname: string): string | null {
  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) {
    return null;
  }
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    return hostname.replace(`.${ROOT_DOMAIN}`, "");
  }
  return null;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
