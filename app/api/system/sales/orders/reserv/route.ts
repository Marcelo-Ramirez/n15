// app/api/system/sales/orders/reserv/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// POST: Cambia el estado del pedido a 'reserv'
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    try {
        const { orderClientId } = await req.json();

        if (!orderClientId) {
            return NextResponse.json({ success: false, error: "ID de pedido es obligatorio" }, { status: 400 });
        }

        const numericOrderClientId = Number(orderClientId);

        // 1. Actualizar el estado del OrderClient a 'reserv'
        const updatedOrder = await prisma.orderClient.update({
            where: { id: numericOrderClientId, status: { not: 'sale' } }, // Solo si no está ya vendido
            data: { status: 'reserv' },
        });

        return NextResponse.json({ success: true, order: updatedOrder, message: "Pedido reservado con éxito." });
    } catch (error) {
        console.error("ERROR al reservar pedido:", error);
        return NextResponse.json(
            { success: false, error: "Error al registrar la reserva" },
            { status: 500 }
        );
    }
}