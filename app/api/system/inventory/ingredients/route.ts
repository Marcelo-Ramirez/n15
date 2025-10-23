import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

// GET - Obtener todos los ingredientes
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userRole = token.role as string; 
    if (!['stockroom', 'admin'].includes(userRole)) {
      return NextResponse.json({ error: 'No tienes permisos para acceder a ingredientes' }, { status: 403 });
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
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userRole = token.role as string;
    if (!['stockroom', 'admin'].includes(userRole)) {
      return NextResponse.json({ error: 'No tienes permisos para crear ingredientes' }, { status: 403 });
    }

    const { name, unit, pricePerUnit, provider } = await request.json();

    if (!name || !unit || !pricePerUnit || !provider) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

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

    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        unit,
        // CORRECCIÓN: Se usa Number.parseFloat
        pricePerUnit: Number.parseFloat(pricePerUnit),
        provider,
        currentQuantity: 0
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

// PATCH - Editar ingrediente
export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userRole = token.role as string;
    if (!['stockroom', 'admin'].includes(userRole)) {
      return NextResponse.json({ error: 'No tienes permisos para editar ingredientes' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const ingredientId = searchParams.get('id');
    if (!ingredientId) {
      return NextResponse.json({ error: 'ID del ingrediente es requerido' }, { status: 400 });
    }
    const { name, unit, pricePerUnit, provider } = await request.json();
    if (!name || !unit || !pricePerUnit || !provider) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }
    
    const updated = await prisma.ingredient.update({
      where: { id: Number.parseInt(ingredientId) }, 
      data: {
        name,
        unit,
        // CORRECCIÓN: Se usa Number.parseFloat
        pricePerUnit: Number.parseFloat(pricePerUnit),
        provider
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
    return NextResponse.json({ success: true, ingredient: updated });
  } catch (error) {
    console.error('Error al editar ingrediente:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar ingrediente
export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userRole = token.role as string;
    if (!['stockroom', 'admin'].includes(userRole)) {
      return NextResponse.json({ error: 'No tienes permisos para eliminar ingredientes' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const ingredientId = searchParams.get('id');

    if (!ingredientId) {
      return NextResponse.json(
        { error: 'ID del ingrediente es requerido' },
        { status: 400 }
      );
    }

    const existingIngredient = await prisma.ingredient.findUnique({
      where: { id: Number.parseInt(ingredientId) } 
    });

    if (!existingIngredient) {
      return NextResponse.json(
        { error: 'Ingrediente no encontrado' },
        { status: 404 }
      );
    }

    await prisma.ingredient.delete({
      where: { id: Number.parseInt(ingredientId) } 
    });

    return NextResponse.json({
      success: true,
      message: 'Ingrediente eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar ingrediente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}