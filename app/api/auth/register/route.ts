import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { username, name, password, registerKey } = await request.json();

    // Validar que todos los campos están presentes
    if (!username || !name || !password || !registerKey) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos incluyendo la clave de registro' },
        { status: 400 }
      );
    }

    // Validar clave de registro
    if (registerKey !== process.env.REGISTER_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Clave de registro inválida' },
        { status: 401 }
      );
    }

    // Validar username (solo letras, números y guiones bajos)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: 'El nombre de usuario solo puede contener letras, números y guiones bajos' },
        { status: 400 }
      );
    }

    // Validar contraseña (mínimo 6 caracteres)
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Validar nombre
    if (name.length < 2) {
      return NextResponse.json(
        { error: 'El nombre debe tener al menos 2 caracteres' },
        { status: 400 }
      );
    }

    // Crear el usuario
    const user = await createUser(username, name, password);

    if (user) {
      return NextResponse.json(
        { 
          message: 'Usuario creado exitosamente',
          user: {
            id: user.id,
            username: user.username,
            name: user.name
          }
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: 'Error al crear el usuario' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error en registro:', error);
    
    // Si el error es por usuario duplicado
    if (error.message === 'El usuario ya existe') {
      return NextResponse.json(
        { error: 'Este nombre de usuario ya está registrado' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
