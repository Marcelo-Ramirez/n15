import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userName, name, phone, password, confirmPassword, role, registrationKey } = await request.json();

    // Validar que todos los campos están presentes
    if (!userName || !name || !phone || !password || !confirmPassword || !role || !registrationKey) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar que las contraseñas coinciden
    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: 'Las contraseñas no coinciden' },
        { status: 400 }
      );
    }

    // Validar clave de registro
    if (registrationKey !== process.env.REGISTRATION_KEY) {
      return NextResponse.json(
        { message: 'Clave de registro inválida' },
        { status: 401 }
      );
    }

    // Validar userName (solo letras, números y guiones bajos)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(userName)) {
      return NextResponse.json(
        { message: 'El nombre de usuario solo puede contener letras, números y guiones bajos' },
        { status: 400 }
      );
    }

    // Validar contraseña (mínimo 6 caracteres)
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Validar nombre
    if (name.length < 2) {
      return NextResponse.json(
        { message: 'El nombre debe tener al menos 2 caracteres' },
        { status: 400 }
      );
    }

    // Validar rol
    const validRoles = ['admin', 'stockroom', 'sales'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { message: 'Rol inválido' },
        { status: 400 }
      );
    }

    // Crear el usuario con los nuevos campos
    const user = await createUser(userName, name, password, phone, role);

    if (user) {
      return NextResponse.json(
        { 
          message: 'Usuario creado exitosamente',
          user: {
            id: user.id,
            userName: user.userName,
            name: user.name,
            role: user.role
          }
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { message: 'Error al crear el usuario' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error en registro:', error);
    
    // Si el error es por usuario duplicado
    if (error.message === 'El usuario ya existe') {
      return NextResponse.json(
        { message: 'Este nombre de usuario ya está registrado' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
