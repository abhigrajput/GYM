import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/privacy",
  "/terms",
  "/pricing",
  "/about",
  "/api/health",
  "/api/well-known/assetlinks",
]

const STATIC_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ico",
  ".webp",
  ".woff",
  ".woff2",
  ".ttf",
  ".json",
  ".txt",
  ".xml",
  ".mp4",
  ".webm",
  ".css",
  ".js",
]

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true
  if (pathname.startsWith("/join/")) return true
  return false
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext)) ||
    isPublicPath(pathname) ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/well-known")
  ) {
    return NextResponse.next()
  }

  const initialResponse = NextResponse.next({
    request: { headers: request.headers },
  })
  let response = initialResponse

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request: { headers: request.headers } })
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Redirect unauthenticated users from protected routes
    if (!user) {
      if (pathname.startsWith("/member") || pathname.startsWith("/owner") || pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/login", request.url))
      }
      return response
    }

    // Redirect authenticated users away from auth pages
    if (pathname === "/login" || pathname === "/signup") {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

      if (profile?.role === "owner") return NextResponse.redirect(new URL("/owner/dashboard", request.url))
      if (profile?.role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", request.url))
      return NextResponse.redirect(new URL("/member/dashboard", request.url))
    }

    // Admin route protection
    if (pathname.startsWith("/admin")) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
      if (profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/member/dashboard", request.url))
      }
    }

    return response
  } catch {
    return initialResponse
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
