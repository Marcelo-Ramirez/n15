import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validar que ambos campos están presentes
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username y password son requeridos' },
        { status: 400 }
      );
    }

    // Verificar las credenciales del usuario
    const user = await verifyUser(username, password);

    if (!user) {
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Crear la respuesta con la información del usuario
    const response = NextResponse.json(
      { 
        message: 'Login exitoso',
        user: {
          id: user.id,
          userName: user.userName,
          name: user.name,
          role: user.role
        }
      },
      { status: 200 }
    );

    // Establecer cookies de sesión
    const sessionData = JSON.stringify({
      userId: user.id,
      userName: user.userName,
      name: user.name,
      role: user.role
    });

    response.cookies.set('session', sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error('Error en login:', error);
    
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
