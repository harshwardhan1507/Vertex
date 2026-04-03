import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  
  // Protected routes — must be logged in
  const protectedPaths = ['/dashboard', '/events', '/clubs', '/organizer', '/admin', '/registrations', '/leaderboard', '/certificates']
  const isProtected = protectedPaths.some(path => pathname.startsWith(path))

  if (!user && isProtected) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role Based Access Control
  if (user) {
    // Fetch the REAL role from the database — this is the single source of truth.
    // The JWT user_metadata can become stale when seed scripts or admin tools
    // update the public.users table without also updating auth metadata.
    const { data: dbUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = dbUser?.role || user.user_metadata?.role || 'student'

    // Guard organizer routes
    if (pathname.startsWith('/organizer') && role !== 'organizer' && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Guard admin routes
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Auth pages — if already logged in redirect to their dashboard
    const authPaths = ['/login', '/signup']
    const isAuthPage = authPaths.some(path => pathname === path)

    if (isAuthPage) {
      if (role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      if (role === 'organizer') {
        return NextResponse.redirect(new URL('/organizer/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}