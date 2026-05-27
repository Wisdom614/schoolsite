import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Your existing middleware code...
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}