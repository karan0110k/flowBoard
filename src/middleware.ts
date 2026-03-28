import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/src/lib/auth'

const protectedRoutes = ['/dashboard', '/boards', '/templates']
const publicRoutes = ['/login', '/signup', '/']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = publicRoutes.includes(path)

  const sessionCookie = request.cookies.get('session')?.value
  const session = sessionCookie ? await decrypt(sessionCookie) : null
  
  if (sessionCookie && !session) {
    console.log("Middleware: Session cookie found but decryption failed. Stale or invalid secret?");
  }

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.nextUrl))
  }

  if (isPublicRoute && session && path !== '/') {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
