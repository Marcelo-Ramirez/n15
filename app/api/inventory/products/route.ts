import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";

const cleanupUnusedImages = async () => {
  try {
    const products = await prisma.product.findMany({
      select: { imagePath: true }
    });
    
    const usedImages = products
      .map(p => p.imagePath)
      .filter(Boolean)
      .map(url => url?.split('/').pop())
      .filter(Boolean);

    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      return { deleted: 0, total: 0 };
    }

    const allFiles = fs.readdirSync(uploadsDir);
    const imageFiles = allFiles.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    let deletedCount = 0;
    for (const file of imageFiles) {
      if (!usedImages.includes(file)) {
        fs.unlinkSync(path.join(uploadsDir, file));
        deletedCount++;
      }
    }
    
    return { deleted: deletedCount, total: imageFiles.length };
    
  } catch (error) {
    console.error("Cleanup error:", error);
    return { deleted: 0, total: 0 };
  }
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, costPerUnit, tipo, sabor, imagePath, currentQuantity } = body;

    if (!name || !tipo || costPerUnit == null) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
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

    await cleanupUnusedImages();

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

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, description, costPerUnit, tipo, sabor, imagePath, currentQuantity } = body;

    if (!id || !name || !tipo || costPerUnit == null) {
      return NextResponse.json({
         success: false,
         error: "Missing required fields"
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

    await cleanupUnusedImages();

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
    
    const cleanup = await cleanupUnusedImages();

    return NextResponse.json({ 
      success: true,
      cleanup: cleanup
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Internal server error" 
    }, { status: 500 });
  }
}