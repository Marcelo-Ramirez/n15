import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const roleToPath: { [key: string]: string } = {
    ventas: 'sales',
    almacen: 'stockroom',
    admin: 'admin',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow the 2FA verification page to be accessed without an existing token
  // This prevents redirect loops when the token/cookie isn't yet available
  if (pathname.startsWith('/sys/2fa')) return NextResponse.next()

  // The secret must be the same as in [...nextauth].ts
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  const hasToken = !!token;
  // Consider a user authenticated only if they have a token AND do NOT require 2FA
  const isAuthenticated = hasToken && !token?.requires2FA;
  const userRole = token?.role as string | undefined;
  const pathRole = userRole ? roleToPath[userRole] || userRole : undefined;
  const requires2FA = !!token?.requires2FA;

  // If user still needs to confirm 2FA, redirect them to the 2FA page (unless they're at login)
    if (requires2FA) {
    const twoFaUrl = new URL('/sys/2fa', request.url);
    twoFaUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(twoFaUrl);
  }

  // If the request is not for /sys, let it through
  if (!pathname.startsWith('/sys')) return NextResponse.next()

  // If user is logged in, redirect from login page to their dashboard
  if (isAuthenticated && pathname.startsWith('/sys/login')) {
    const targetUrl = new URL(`/sys/${pathRole}/dashboard`, request.url);
    return NextResponse.redirect(targetUrl);
  }

  // Allow access to login and register pages without auth
  if (pathname.startsWith('/sys/login') || pathname.startsWith('/sys/register')) return NextResponse.next()

  // Protect /sys routes: if not authenticated, send to login
  if (!isAuthenticated) {
    const loginUrl = new URL('/sys/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is authenticated but tries to access another role's area, redirect to correct dashboard
  if (pathRole && !pathname.startsWith(`/sys/${pathRole}`)) {
    const correctDashboardUrl = new URL(`/sys/${pathRole}/dashboard`, request.url);
    return NextResponse.redirect(correctDashboardUrl);
  }

  return NextResponse.next()
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: [
    '/sys/:path*',
  ]
}