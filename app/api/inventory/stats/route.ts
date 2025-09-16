import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Obtener estadísticas del inventario
export async function GET() {
  try {
    // Obtener todos los ingredientes para calcular estadísticas
    const ingredients = await prisma.ingredient.findMany();

    const stats = {
      totalIngredients: ingredients.length,
      totalValue: ingredients.reduce((sum, ing) => sum + (ing.currentQuantity * ing.pricePerUnit), 0),
      lowStockCount: ingredients.filter(ing => ing.currentQuantity <= ing.minStock * 1.5 && ing.currentQuantity > ing.minStock).length,
      criticalStockCount: ingredients.filter(ing => ing.currentQuantity <= ing.minStock).length,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching inventory stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
