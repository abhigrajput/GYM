import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const PUBLIC_ROUTES = new Set([
  "/",
  "/login",
  "/signup",
  "/manifest.json",
  "/sw.js",
  "/api/health",
  "/privacy",
  "/terms",
  "/favicon.ico",
])

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname === "/favicon.ico"
  )
}

function isProtectedRoute(pathname: string) {
  return pathname.startsWith("/member") || pathname.startsWith("/owner")
}

function dashboardFromRole(role: string | null | undefined) {
  if (role === "owner") return "/owner/dashboard"
  return "/member/dashboard"
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Never run auth for static assets & public pages (matcher should skip these too)
  if (isPublicAsset(pathname) || PUBLIC_ROUTES.has(pathname)) {
    return NextResponse.next()
  }

  const response = NextResponse.next({ request })
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || !/^https?:\/\//.test(supabaseUrl)) {
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isProtectedRoute(pathname) && !user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if ((pathname === "/login" || pathname === "/signup") && user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()

    return NextResponse.redirect(new URL(dashboardFromRole(profile?.role), request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/|favicon\\.ico|manifest\\.json|icons|sw\\.js|api/health|privacy|terms).*)",
  ],
}
