import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener ingrediente específico
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const paramsObj = await context.params;
    const ingredientId = parseInt(paramsObj.id);

    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
      include: {
        inventoryMovements: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { name: true, userName: true }
            }
          }
        },
        ingredientEOQ: true
      }
    });

    if (!ingredient) {
      return NextResponse.json(
        { error: 'Ingrediente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(ingredient);
  } catch (error) {
    console.error('Error fetching ingredient:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar ingrediente
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const paramsObj = await context.params;
    const ingredientId = parseInt(paramsObj.id);
    const data = await request.json();
    const { name, unit, pricePerUnit, provider } = data;

    const ingredient = await prisma.ingredient.update({
      where: { id: ingredientId },
      data: { name, unit, pricePerUnit, provider }
    });

    return NextResponse.json(ingredient);
  } catch (error) {
    console.error('Error updating ingredient:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar ingrediente
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const paramsObj = await context.params;
    const ingredientId = parseInt(paramsObj.id);

    await prisma.ingredient.delete({
      where: { id: ingredientId }
    });

    return NextResponse.json({ message: 'Ingrediente eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
