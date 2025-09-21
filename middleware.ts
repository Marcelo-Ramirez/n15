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
      // Si está autenticado, redirigir a su página de usuario según el rol
      const userUrl = new URL(`/sys/${session.role}/user`, request.url)
      return NextResponse.redirect(userUrl)
    } else {
      // Si no está autenticado, redirigir a login
      const loginUrl = new URL('/sys/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Si accede a /sys/login y ya está autenticado, redirigir a su página de usuario
  if (pathname === '/sys/login' && session && session.role) {
    const userUrl = new URL(`/sys/${session.role}/user`, request.url)
    return NextResponse.redirect(userUrl)
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
      
      // Si el rol no coincide, redirigir a la página de usuario correcta
      if (session.role !== requiredRole) {
        const correctUserUrl = new URL(`/sys/${session.role}/user`, request.url)
        return NextResponse.redirect(correctUserUrl)
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
