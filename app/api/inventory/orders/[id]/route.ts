import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";

// ---------------------------
// PUT - Actualizar estado del pedido
// ---------------------------
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; // 👈 aquí se hace await
    const body = await req.json();
    const { status } = body as { status: string };

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "ID y estado son requeridos" },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.orderClient.update({
      where: { id: Number(id) },
      data: { status },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Error actualizando pedido:", error);
    return NextResponse.json(
      { success: false, error: (error as any).message },
      { status: 500 }
    );
  }
}

// ---------------------------
// DELETE - Eliminar pedido
// ---------------------------
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; // 👈 también await aquí

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID de pedido requerido" },
        { status: 400 }
      );
    }

    await prisma.orderClient.delete({ where: { id: Number(id) } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando pedido:", error);
    return NextResponse.json(
      { success: false, error: (error as any).message },
      { status: 500 }
    );
  }
}
