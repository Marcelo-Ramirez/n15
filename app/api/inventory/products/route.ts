import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET: Obtener todos los productos
export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener productos" },
      { status: 500 }
    );
  }
}

// POST: Crear un nuevo producto (sin sesión)
export async function POST(req: Request) {
  try {
    const { name, flavor, type, pricePerUnit, imageUrl, currentQuantity } =
      await req.json();

    const newProduct = await prisma.product.create({
      data: {
        name,
        flavor,
        type,
        pricePerUnit,
        imageUrl,
        currentQuantity,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear producto" },
      { status: 500 }
    );
  }
}
