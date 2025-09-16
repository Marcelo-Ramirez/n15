import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST - Poblar base de datos con ingredientes de ejemplo
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = Number(session.user.id);

    // Verificar si ya hay ingredientes
    const existingCount = await prisma.ingredient.count();
    if (existingCount > 0) {
      return NextResponse.json(
        { message: "Ya existen ingredientes en la base de datos" },
        { status: 200 }
      );
    }

    // Datos de ejemplo para gomitas naturales
    const sampleIngredients = [
      {
        name: "Miel orgánica",
        currentQuantity: 5.2,
        unit: "kg",
        minStock: 2.0,
        pricePerUnit: 8.50,
        status: "normal"
      },
      {
        name: "Gelatina sin sabor",
        currentQuantity: 2.5,
        unit: "kg",
        minStock: 1.0,
        pricePerUnit: 12.00,
        status: "normal"
      },
      {
        name: "Pulpa de fresa",
        currentQuantity: 3.5,
        unit: "kg",
        minStock: 2.0,
        pricePerUnit: 4.20,
        status: "normal"
      },
      {
        name: "Pulpa de mango",
        currentQuantity: 1.2,
        unit: "kg",
        minStock: 2.0,
        pricePerUnit: 3.80,
        status: "critico"
      },
      {
        name: "Pulpa de maracuyá",
        currentQuantity: 2.8,
        unit: "kg",
        minStock: 1.5,
        pricePerUnit: 5.10,
        status: "normal"
      },
      {
        name: "Pulpa de piña",
        currentQuantity: 2.1,
        unit: "kg",
        minStock: 1.5,
        pricePerUnit: 3.60,
        status: "normal"
      },
      {
        name: "Pulpa de guayaba",
        currentQuantity: 0.9,
        unit: "kg",
        minStock: 1.5,
        pricePerUnit: 4.50,
        status: "critico"
      },
      {
        name: "Pulpa de mora",
        currentQuantity: 1.7,
        unit: "kg",
        minStock: 1.0,
        pricePerUnit: 6.20,
        status: "normal"
      },
      {
        name: "Pulpa de lulo",
        currentQuantity: 0.6,
        unit: "kg",
        minStock: 1.0,
        pricePerUnit: 5.80,
        status: "critico"
      },
      {
        name: "Pulpa de manzana",
        currentQuantity: 2.3,
        unit: "kg",
        minStock: 1.5,
        pricePerUnit: 3.90,
        status: "normal"
      },
      {
        name: "Pulpa de naranja",
        currentQuantity: 3.1,
        unit: "kg",
        minStock: 2.0,
        pricePerUnit: 3.20,
        status: "normal"
      },
      {
        name: "Pulpa de kiwi",
        currentQuantity: 1.4,
        unit: "kg",
        minStock: 1.0,
        pricePerUnit: 7.80,
        status: "normal"
      },
      {
        name: "Pulpa de coconut",
        currentQuantity: 1.8,
        unit: "kg",
        minStock: 1.2,
        pricePerUnit: 6.50,
        status: "normal"
      },
      {
        name: "Envolturas biodegradables",
        currentQuantity: 2500,
        unit: "unidades",
        minStock: 1000,
        pricePerUnit: 0.05,
        status: "normal"
      }
    ];

    // Crear ingredientes y movimientos iniciales en transacción
    const results = await prisma.$transaction(async (tx) => {
      const createdIngredients = [];
      
      for (const ingredientData of sampleIngredients) {
        // Crear ingrediente
        const ingredient = await tx.ingredient.create({
          data: ingredientData
        });
        
        // Crear movimiento inicial si hay stock
        if (ingredientData.currentQuantity > 0) {
          await tx.inventoryMovement.create({
            data: {
              ingredientId: ingredient.id,
              userId: userId,
              movementType: 'entrada',
              reason: 'ajuste',
              quantity: ingredientData.currentQuantity,
              previousQuantity: 0,
              newQuantity: ingredientData.currentQuantity,
              notes: 'Stock inicial del sistema',
              createdBy: userId,
            }
          });
        }
        
        createdIngredients.push(ingredient);
      }
      
      return createdIngredients;
    });

    return NextResponse.json({
      message: "Datos de ejemplo creados exitosamente",
      count: results.length
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating sample data:", error);
    return NextResponse.json(
      { error: "Error al crear datos de ejemplo" },
      { status: 500 }
    );
  }
}
