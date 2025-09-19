import { NextResponse } from "next/server";
import {prisma} from "@/lib/db"; // Tu cliente Prisma

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, costPerUnit, tipo, sabor, imagePath, currentQuantity, ingredients } = body;

    // Crear el producto
    const product = await prisma.product.create({
      data: {
        name,
        description,
        costPerUnit,
        tipo,
        sabor,
        imagePath,
        currentQuantity,
      }
    });

    // Crear la receta (ProductIngredient)
    if (ingredients && ingredients.length > 0) {
      const ingredientsData = ingredients.map((ing: any) => ({
        productId: product.id,
        ingredientId: ing.id,
        quantity: ing.quantity
      }));

      await prisma.productIngredient.createMany({ data: ingredientsData });
    }

    // Opcional: registrar el stock inicial como movimiento
    if (currentQuantity > 0) {
      await prisma.productMovement.create({
        data: {
          productId: product.id,
          userId: 1, // o el ID del admin que crea el producto
          typeMovement: "entrada",
          reason: "stock inicial",
          quantity: currentQuantity,
          previousQuantity: 0,
          newQuantity: currentQuantity
        }
      });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: (error as any).message }, { status: 500 });
  }
}
