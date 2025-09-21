import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener todos los ingredientes
export async function GET() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      include: {
        inventoryMovements: {
          take: 5, // Últimos 5 movimientos
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { name: true, userName: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo ingrediente
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, unit, pricePerUnit, provider, currentQuantity } = data;

    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        unit,
        pricePerUnit,
        provider,
        currentQuantity
      }
    });

    return NextResponse.json(ingredient);
  } catch (error) {
    console.error('Error creating ingredient:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
