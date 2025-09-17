import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Obtener todos los ingredientes
export async function GET() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    // Calcular el estado de cada ingrediente
    const ingredientsWithStatus = ingredients.map(ingredient => ({
      ...ingredient,
      status: ingredient.reorderPoint 
        ? ingredient.currentQuantity <= ingredient.reorderPoint 
          ? 'critico' 
          : ingredient.currentQuantity <= ingredient.reorderPoint * 1.5 
          ? 'bajo' 
          : 'normal'
        : 'normal' // Si no hay punto de reorden definido, siempre es normal
    }));

    return NextResponse.json(ingredientsWithStatus);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return NextResponse.json(
      { error: "Error al obtener ingredientes" },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo ingrediente
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, unit, reorderPoint, pricePerUnit } = await req.json();

    if (!name || !unit || pricePerUnit === undefined) {
      return NextResponse.json(
        { error: "Faltan campos requeridos (name, unit, pricePerUnit)" },
        { status: 400 }
      );
    }

    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        unit,
        reorderPoint: reorderPoint !== undefined && reorderPoint !== null ? parseFloat(reorderPoint) : null,
        pricePerUnit,
        currentQuantity: 0, // Siempre inicia en 0
      }
    });

    return NextResponse.json(ingredient, { status: 201 });
  } catch (error) {
    console.error("Error creating ingredient:", error);
    return NextResponse.json(
      { error: "Error al crear ingrediente" },
      { status: 500 }
    );
  }
}
