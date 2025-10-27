import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: Obtener lista completa de pedidos
export async function GET() {
    try {
        const orders = await prisma.orderClient.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                // Incluir el producto
                product: {
                    select: {
                        name: true,
                        type: true,
                        flavor: true,
                        pricePerUnit: true,
                    }
                },
                // Incluir la SaleOrder (venta final) y el usuario
                saleOrder: {
                    select: {
                        // <--- CORRECCIÓN CLAVE: Incluir el campo totalCostOrder
                        totalCostOrder: true, 
                        user: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                }
            },
        });

        return NextResponse.json({ orders });

    } catch (error) {
        console.error("ERROR al obtener pedidos:", error);
        return NextResponse.json(
            { error: "Error interno del servidor al obtener pedidos" },
            { status: 500 }
        );
    }
}