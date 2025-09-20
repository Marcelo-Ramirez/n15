import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST - crear producto
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, costPerUnit, tipo, sabor, imagePath, currentQuantity } = body;

    if (!name || !tipo || costPerUnit == null) {
      return NextResponse.json(
        { success: false, error: "Campos obligatorios faltantes: name, tipo, costPerUnit" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || "",
        costPerUnit: parseFloat(costPerUnit),
        tipo,
        sabor: sabor || "",
        imagePath: imagePath || "",
        currentQuantity: currentQuantity ? parseFloat(currentQuantity) : 0,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: (error as any).message }, { status: 500 });
  }
}

// GET - obtener todos los productos
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: (error as any).message }, { status: 500 });
  }
}

// PUT - actualizar producto
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, description, costPerUnit, tipo, sabor, imagePath, currentQuantity } = body;

    if (!id || !name || !tipo || costPerUnit == null) {
      return NextResponse.json({ 
        success: false, 
        error: "Campos obligatorios faltantes: id, name, tipo, costPerUnit" 
      }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description: description || "",
        costPerUnit: parseFloat(costPerUnit),
        tipo,
        sabor: sabor || "",
        imagePath: imagePath || "",
        currentQuantity: currentQuantity ? parseFloat(currentQuantity) : 0,
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: (error as any).message }, { status: 500 });
  }
}

// DELETE - eliminar producto
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "0");

    if (!id) {
      return NextResponse.json({ success: false, error: "Falta el id del producto" }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: (error as any).message }, { status: 500 });
  }
}