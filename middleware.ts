import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip middleware for API routes and static files
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Define public paths that don't require auth
  const isPublicPath = request.nextUrl.pathname === '/admin/login'
  
  // If trying to access admin routes without session, redirect to login
  if (request.nextUrl.pathname.startsWith('/admin') && !isPublicPath) {
    if (!session) {
      const redirectUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If already logged in and trying to access login page, redirect to dashboard
  if (isPublicPath && session) {
    const redirectUrl = new URL('/admin/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}