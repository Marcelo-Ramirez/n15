import { NextRequest, NextResponse } from 'next/server';
// Importa el tipo 'Ingredient' para usarlo
import { PrismaClient, Ingredient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener métricas de inventario
export async function GET() {
  try {
    // Ingredientes con bajo stock (menos del 20% del promedio)
    const ingredients = await prisma.ingredient.findMany();
    
    // --- LÍNEA CORREGIDA ---
    // Añadimos tipos a 'sum' (number) e 'ing' (Ingredient)
    const totalValue = ingredients.reduce((sum: number, ing: Ingredient) => 
      sum + (ing.currentQuantity * ing.pricePerUnit), 0
    );

    const lowStockThreshold = 10; // Definir umbral

    // --- LÍNEA CORREGIDA ---
    // Añadimos el tipo a 'ing' (Ingredient)
    const lowStockItems = ingredients.filter((ing: Ingredient) => 
      ing.currentQuantity < lowStockThreshold
    );

    // Movimientos recientes
    const recentMovements = await prisma.inventoryMovement.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        ingredient: { select: { name: true } },
        user: { select: { name: true } }
      }
    });

    // Ingredientes más utilizados
    const topUsedIngredients = await prisma.inventoryMovement.groupBy({
      by: ['ingredientId'],
      where: { movementType: 'salida' },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    const metrics = {
      totalItems: ingredients.length,
      totalValue,
      lowStockItems: lowStockItems.length,
      lowStockDetails: lowStockItems,
      recentMovements,
      topUsedIngredients
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching inventory analytics:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}