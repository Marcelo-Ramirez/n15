import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Obtener historial de movimientos de un ingrediente
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
const ingredientId = parseInt(resolvedParams.id);

    // Obtener el ingrediente
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId }
    });

    if (!ingredient) {
      return NextResponse.json(
        { error: "Ingrediente no encontrado" },
        { status: 404 }
      );
    }

    // Obtener movimientos con información de usuarios
    const movements = await prisma.inventoryMovement.findMany({
      where: { ingredientId },
      include: {
        user: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      ingredient,
      movements
    });
  } catch (error) {
    console.error("Error fetching ingredient history:", error);
    return NextResponse.json(
      { error: "Error al obtener historial" },
      { status: 500 }
    );
  }
}

// POST - Crear un movimiento de inventario
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const ingredientId = parseInt(resolvedParams.id);
    const { movementType, reason, quantity } = await req.json();

    if (!movementType || !reason || quantity === undefined) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Obtener el ingrediente actual
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId }
    });

    if (!ingredient) {
      return NextResponse.json(
        { error: "Ingrediente no encontrado" },
        { status: 404 }
      );
    }

    const previousQuantity = ingredient.currentQuantity;
    const quantityChange = movementType === 'entrada' ? quantity : -quantity;
    const newQuantity = previousQuantity + quantityChange;

    if (newQuantity < 0) {
      return NextResponse.json(
        { error: "No hay suficiente stock disponible" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const movement = await tx.inventoryMovement.create({
        data: {
          ingredientId,
          userId: Number(session.user.id),
          movementType,
          reason,
          quantity: Math.abs(quantity),
          previousQuantity,
          newQuantity,
        }
      });

      const updatedIngredient = await tx.ingredient.update({
        where: { id: ingredientId },
        data: {
          currentQuantity: newQuantity,
        }
      });

      return { movement, ingredient: updatedIngredient };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating movement:", error);
    return NextResponse.json(
      { error: "Error al crear movimiento" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un ingrediente
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const ingredientId = parseInt(params.id);
    const { name, unit, reorderPoint, pricePerUnit } = await req.json();

    if (!name || !unit || pricePerUnit === undefined) {
      return NextResponse.json(
        { error: "Faltan campos requeridos (name, unit, pricePerUnit)" },
        { status: 400 }
      );
    }

    const existingIngredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId }
    });

    if (!existingIngredient) {
      return NextResponse.json(
        { error: "Ingrediente no encontrado" },
        { status: 404 }
      );
    }

    const updatedIngredient = await prisma.ingredient.update({
      where: { id: ingredientId },
      data: {
        name,
        unit,
        reorderPoint: reorderPoint !== undefined && reorderPoint !== null ? parseFloat(reorderPoint) : null,
        pricePerUnit
      }
    });

    return NextResponse.json(updatedIngredient);
  } catch (error) {
    console.error("Error updating ingredient:", error);
    return NextResponse.json(
      { error: "Error al actualizar ingrediente" },
      { status: 500 }
    );
  }
}
