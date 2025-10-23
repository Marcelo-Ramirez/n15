import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session');
    
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { message: 'No hay sesión activa' },
        { status: 401 }
      );
    }

    try {
      const sessionData = JSON.parse(sessionCookie.value);
      
      return NextResponse.json(
        { 
          message: 'Sesión válida',
          user: sessionData
        },
        { status: 200 }
      );
    } catch (parseError) {
      return NextResponse.json(
        { message: 'Sesión inválida' },
        { status: 401 }
      );
    }

  } catch (error: any) {
    console.error('Error verificando sesión:', error);
    
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
