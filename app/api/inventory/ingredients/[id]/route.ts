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
        },
        createdByUser: {
          select: { id: true, name: true }
        }
      },
      orderBy: { movementDate: 'desc' }
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
    const { movementType, reason, quantity, unitPrice, notes } = await req.json();

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

    // Validar que no quede en negativo
    if (newQuantity < 0) {
      return NextResponse.json(
        { error: "No hay suficiente stock disponible" },
        { status: 400 }
      );
    }

    // Calcular costos para compras
    const totalCost = movementType === 'entrada' && reason === 'compra' && unitPrice 
      ? quantity * unitPrice 
      : undefined;

    // Crear el movimiento en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear el movimiento
      const movement = await tx.inventoryMovement.create({
        data: {
          ingredientId,
          userId: Number(session.user.id),
          movementType,
          reason,
          quantity: Math.abs(quantity),
          previousQuantity,
          newQuantity,
          unitPrice,
          totalCost,
          notes,
          createdBy: Number(session.user.id),
        }
      });

      // Actualizar el stock del ingrediente
      const updatedIngredient = await tx.ingredient.update({
        where: { id: ingredientId },
        data: {
          currentQuantity: newQuantity,
          status: newQuantity <= ingredient.minStock 
            ? 'critico' 
            : newQuantity <= ingredient.minStock * 1.5 
            ? 'bajo' 
            : 'normal'
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
