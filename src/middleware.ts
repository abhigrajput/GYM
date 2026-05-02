import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const PUBLIC_ROUTES = new Set(["/", "/login", "/signup", "/api/health"])

function isProtectedRoute(pathname: string) {
  return pathname.startsWith("/member") || pathname.startsWith("/owner")
}

function dashboardFromRole(role: string | null | undefined) {
  if (role === "owner") return "/owner/dashboard"
  return "/member/dashboard"
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || !/^https?:\/\//.test(supabaseUrl)) {
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
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
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  if (isProtectedRoute(pathname) && !user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if ((pathname === "/login" || pathname === "/signup") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    return NextResponse.redirect(new URL(dashboardFromRole(profile?.role), request.url))
  }

  if (
    !PUBLIC_ROUTES.has(pathname) &&
    !isProtectedRoute(pathname) &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    !pathname.includes(".")
  ) {
    return response
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
