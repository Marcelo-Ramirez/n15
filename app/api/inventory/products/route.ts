import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, flavor, type, pricePerUnit, currentQuantity, imageUrl } = body;

    if (!name || !type || !flavor || pricePerUnit == null) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, type, flavor, pricePerUnit" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        flavor,
        type,
        imageUrl: imageUrl || "", // Obligatorio según el esquema
        pricePerUnit: parseFloat(pricePerUnit),
        currentQuantity: currentQuantity ? parseFloat(currentQuantity) : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Internal server error" 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Internal server error" 
    }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "0");
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: "Missing product id"
      }, { status: 400 });
    }

    const body = await req.json();
    const { name, flavor, type, pricePerUnit, imageUrl } = body;

    if (!name || !type || !flavor || pricePerUnit == null) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields: name, type, flavor, pricePerUnit"
      }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id: id },
      data: {
        name,
        flavor,
        type,
        ...(imageUrl !== undefined && { imageUrl }), // Solo actualizar si se envía
        pricePerUnit: parseFloat(pricePerUnit),
        updatedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Internal server error" 
    }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "0");

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing product id" 
      }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ 
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Internal server error" 
    }, { status: 500 });
  }
}