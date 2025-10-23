import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (token.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar usuarios' },
        { status: 403 }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    // Eliminar usuario (desactivar cuenta)
    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { statusAccount: "inactive" },
      select: {
        id: true,
        userName: true,
        name: true,
        statusAccount: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
      user
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}