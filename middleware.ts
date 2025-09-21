import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function getSessionFromRequest(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }
  
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = getSessionFromRequest(request);

  // Si accede a /sys (exactamente)
  if (pathname === '/sys') {
    if (session && session.role) {
      // Si está autenticado, redirigir a su dashboard según el rol
      const dashboardUrl = new URL(`/sys/${session.role}/dashboard`, request.url)
      return NextResponse.redirect(dashboardUrl)
    } else {
      // Si no está autenticado, redirigir a login
      const loginUrl = new URL('/sys/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Si accede a /sys/login y ya está autenticado, redirigir a su dashboard
  if (pathname === '/sys/login' && session && session.role) {
    const dashboardUrl = new URL(`/sys/${session.role}/dashboard`, request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // Si la ruta comienza con /sys pero NO es /sys/login o /sys/register
  if (pathname.startsWith('/sys') && 
      !pathname.startsWith('/sys/login') && 
      !pathname.startsWith('/sys/register')) {
    
    // Si no hay sesión, redirigir a login
    if (!session) {
      const loginUrl = new URL('/sys/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Verificar si la ruta coincide con el rol del usuario
    const roleMatch = pathname.match(/^\/sys\/(admin|stockroom|sales)\//)
    if (roleMatch) {
      const requiredRole = roleMatch[1]
      
      // Si el rol no coincide, redirigir al dashboard correcto
      if (session.role !== requiredRole) {
        const correctDashboardUrl = new URL(`/sys/${session.role}/dashboard`, request.url)
        return NextResponse.redirect(correctDashboardUrl)
      }
    }
  }

  return NextResponse.next()
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: [
    '/sys/:path*',
  ]
}
