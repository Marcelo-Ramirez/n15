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
      status: ingredient.currentQuantity <= ingredient.minStock 
        ? 'critico' 
        : ingredient.currentQuantity <= ingredient.minStock * 1.5 
        ? 'bajo' 
        : 'normal'
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
    const { name, unit, minStock, pricePerUnit, initialQuantity = 0 } = await req.json();

    if (!name || !unit || minStock === undefined || pricePerUnit === undefined) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        unit,
        minStock,
        pricePerUnit,
        currentQuantity: initialQuantity,
        status: initialQuantity <= minStock ? 'critico' : 'normal'
      }
    });

    // Si hay cantidad inicial, crear el movimiento inicial
    if (initialQuantity > 0) {
      await prisma.inventoryMovement.create({
        data: {
          ingredientId: ingredient.id,
          userId: Number(session.user.id),
          movementType: 'entrada',
          reason: 'ajuste',
          quantity: initialQuantity,
          previousQuantity: 0,
          newQuantity: initialQuantity,
          notes: 'Stock inicial',
          createdBy: Number(session.user.id),
        }
      });
    }

    return NextResponse.json(ingredient, { status: 201 });
  } catch (error) {
    console.error("Error creating ingredient:", error);
    return NextResponse.json(
      { error: "Error al crear ingrediente" },
      { status: 500 }
    );
  }
}
