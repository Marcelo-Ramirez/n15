import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Obtener todos los ingredientes
export async function GET() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(ingredients);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return NextResponse.json(
      { error: "Error al obtener ingredientes" },
      { status: 500 }
    );
  }
}