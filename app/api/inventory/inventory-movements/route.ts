import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Obtener todos los movimientos de inventario
export async function GET() {
  try {
    const movements = await prisma.inventoryMovement.findMany({
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(movements);
  } catch (error) {
    console.error("Error fetching inventory movements:", error);
    return NextResponse.json(
      { error: "Error al obtener movimientos" },
      { status: 500 }
    );
  }
}
