import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// GET - Obtener todos los ingredientes
export async function GET() {
  try {
    // Verificar sesión desde cookies
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json(
        { error: 'Sesión inválida' },
        { status: 401 }
      );
    }

    // Verificar que el usuario tenga permisos (stockroom o admin)
    if (!['stockroom', 'admin'].includes(sessionData.role)) {
      return NextResponse.json(
        { error: 'No tienes permisos para acceder a ingredientes' },
        { status: 403 }
      );
    }

    const ingredients = await prisma.ingredient.findMany({
      select: {
        id: true,
        name: true,
        unit: true,
        pricePerUnit: true,
        provider: true,
        currentQuantity: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      ingredients
    });
  } catch (error) {
    console.error('Error al obtener ingredientes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo ingrediente
export async function POST(request: NextRequest) {
  try {
    // Verificar sesión desde cookies
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json(
        { error: 'Sesión inválida' },
        { status: 401 }
      );
    }

    // Verificar que el usuario tenga permisos (stockroom o admin)
    if (!['stockroom', 'admin'].includes(sessionData.role)) {
      return NextResponse.json(
        { error: 'No tienes permisos para crear ingredientes' },
        { status: 403 }
      );
    }

    const { name, unit, pricePerUnit, provider } = await request.json();

    // Validar campos requeridos
    if (!name || !unit || !pricePerUnit || !provider) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el ingrediente ya existe
    const existingIngredient = await prisma.ingredient.findFirst({
      where: { 
        name: name,
        provider: provider 
      }
    });

    if (existingIngredient) {
      return NextResponse.json(
        { error: 'Ya existe un ingrediente con ese nombre del mismo proveedor' },
        { status: 400 }
      );
    }

    // Crear el ingrediente
    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        unit,
        pricePerUnit: parseFloat(pricePerUnit),
        provider,
        currentQuantity: 0 // Inicializar en 0
      },
      select: {
        id: true,
        name: true,
        unit: true,
        pricePerUnit: true,
        provider: true,
        currentQuantity: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Ingrediente creado exitosamente',
      ingredient
    });
  } catch (error) {
    console.error('Error al crear ingrediente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar ingrediente
export async function DELETE(request: NextRequest) {
  try {
    // Verificar sesión desde cookies
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json(
        { error: 'Sesión inválida' },
        { status: 401 }
      );
    }

    // Verificar que el usuario tenga permisos (stockroom o admin)
    if (!['stockroom', 'admin'].includes(sessionData.role)) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar ingredientes' },
        { status: 403 }
      );
    }

    // Obtener el ID del ingrediente desde los parámetros de la URL
    const { searchParams } = new URL(request.url);
    const ingredientId = searchParams.get('id');

    if (!ingredientId) {
      return NextResponse.json(
        { error: 'ID del ingrediente es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el ingrediente existe
    const existingIngredient = await prisma.ingredient.findUnique({
      where: { id: parseInt(ingredientId) }
    });

    if (!existingIngredient) {
      return NextResponse.json(
        { error: 'Ingrediente no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar el ingrediente (esto también eliminará automáticamente 
    // los movimientos relacionados si hay configuración CASCADE en la BD)
    await prisma.ingredient.delete({
      where: { id: parseInt(ingredientId) }
    });

    return NextResponse.json({
      success: true,
      message: 'Ingrediente y su historial de movimientos eliminados exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar ingrediente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
