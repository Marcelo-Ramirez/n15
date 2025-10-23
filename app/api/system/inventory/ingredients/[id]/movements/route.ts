import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Crear movimiento de inventario
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const paramsObj = await context.params;
    const ingredientId = parseInt(paramsObj.id);
    const data = await request.json();
    const { userId, movementType, reason, quantity } = data;

    // Obtener ingrediente actual
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId }
    });

    if (!ingredient) {
      return NextResponse.json(
        { error: 'Ingrediente no encontrado' },
        { status: 404 }
      );
    }

    // Calcular nueva cantidad
    let newQuantity = ingredient.currentQuantity;
    if (movementType === 'entrada') {
      newQuantity += quantity;
    } else if (movementType === 'salida') {
      newQuantity -= quantity;
      if (newQuantity < 0) {
        return NextResponse.json(
          { error: 'Stock insuficiente' },
          { status: 400 }
        );
      }
    }

    // Crear movimiento y actualizar ingrediente en transacción
    const result = await prisma.$transaction([
      prisma.inventoryMovement.create({
        data: {
          userId,
          ingredientId,
          movementType,
          reason,
          quantity
        }
      }),
      prisma.ingredient.update({
        where: { id: ingredientId },
        data: { currentQuantity: newQuantity }
      })
    ]);

    return NextResponse.json({
      movement: result[0],
      ingredient: result[1]
    });
  } catch (error) {
    console.error('Error creating movement:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
