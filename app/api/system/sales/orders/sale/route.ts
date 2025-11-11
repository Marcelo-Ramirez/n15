import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth"; // Asumo que usas NextAuth para el usuario

export async function POST(req: Request) {
    // 1. Obtener la sesión y validar el usuario (Asumido)
    const session = await getServerSession();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const userId = session.user.id; 
    
    // 2. Obtener y validar el body
    const { orderClientId: orderClientIdRaw } = await req.json();
    const numericOrderClientId = parseInt(orderClientIdRaw as string);

    if (isNaN(numericOrderClientId)) {
        return NextResponse.json({ error: "ID de pedido inválido" }, { status: 400 });
    }

    try {
        // Ejecutar la lógica de venta dentro de una Transacción
        const saleResult = await prisma.$transaction(async (tx) => {
            
            // A. Obtener el pedido y su producto asociado para chequear stock y estado
            const orderClient = await tx.orderClient.findUnique({
                where: { id: numericOrderClientId },
                include: { 
                    product: { select: { id: true, stock: true } },
                    saleOrder: { select: { id: true } } // Para verificar existencia de venta previa
                }
            });

            if (!orderClient) {
                throw new Error("Pedido no encontrado.");
            }
            
            // B. Prevenir el error P2002: Ya vendido
            if (orderClient.saleOrder) {
                // Si saleOrder ya existe, lanza un error para prevenir el P2002
                throw new Error("P2002: Este pedido ya ha sido confirmado como venta.");
            }
            
            // C. Prevenir la falta de Stock
            if (!orderClient.product || orderClient.product.stock < orderClient.quantity) {
                // Esto generará la notificación "verifique el stock" en el frontend si capturas el mensaje
                throw new Error("Verifique el stock. Cantidad solicitada supera el stock disponible.");
            }
            
            // D. Ejecutar la VENTA y actualización de Stock
            
            // 1. Crear el registro SaleOrder
            const saleOrder = await tx.saleOrder.create({
                data: {
                    userId: userId,
                    orderClientId: numericOrderClientId,
                    totalCostOrder: orderClient.quantity * orderClient.product.pricePerUnit, // Asumiendo que el precio viene de OrderClient/Product
                }
            });

            // 2. Actualizar el estado del OrderClient a 'sale'
            await tx.orderClient.update({
                where: { id: numericOrderClientId },
                data: { status: 'sale' }
            });

            // 3. Reducir el stock del producto
            await tx.product.update({
                where: { id: orderClient.product.id },
                data: {
                    stock: {
                        decrement: orderClient.quantity,
                    }
                }
            });
            
            return saleOrder;
        });

        return NextResponse.json({ success: true, saleOrder: saleResult });

    } catch (error) {
        // Manejar errores de la transacción (P2002 o Stock)
        console.error("Error en la venta:", error);

        // Si es el error P2002 o el error de stock que definimos, se devuelve un 400
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al procesar la venta.";
        
        return NextResponse.json(
            { error: errorMessage },
            { status: 400 } // Usar 400 para errores de lógica de negocio o validación (incluyendo P2002 prevenido)
        );
    }
}