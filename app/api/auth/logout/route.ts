import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: 'Logout exitoso' },
      { status: 200 }
    );

    // Eliminar la cookie de sesión
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return response;

  } catch (error: unknown) {
    console.error('Error en logout:', error);
    
    // Opcional: Si necesitas leer el mensaje del error, usa la verificación 'instanceof Error'.
    // if (error instanceof Error) {
    //   console.error('Mensaje:', error.message);
    // }

    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}