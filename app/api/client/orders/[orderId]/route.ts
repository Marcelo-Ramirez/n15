// app/api/orders/[orderId]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // ⚡️ Asegúrate que sea /prisma si es tu alias
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // ⚡️ Ajusta la ruta

interface RouteParams {
    params: { orderId: string }
}

export async function GET(request: Request, { params }: RouteParams) {
    const session = await getServerSession(authOptions);
    const { orderId } = params;

    // ... (Verificaciones de sesión y IDs) ...
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const clientId = parseInt(session.user.id, 10);
    const requestedOrderId = parseInt(orderId, 10); // ID de OrderClient
    if (isNaN(clientId) || isNaN(requestedOrderId)) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }
    // ...

    try {
        const saleOrder = await prisma.saleOrder.findUnique({
            where: { 
                orderClientId: requestedOrderId,
                userId: clientId 
            },
            include: {
                orderClient: { select: { status: true, createdAt: true } },
                saleProducts: { 
                    include: {
                        product: { 
                            // ✅ CORRECCIÓN: Seleccionar también pricePerUnit
                            select: { name: true, imageUrl: true, pricePerUnit: true } 
                        }
                    }
                }
            }
        });

        if (!saleOrder) {
            return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
        }

        // Formatear la respuesta
        const orderDetails = {
            id: saleOrder.id,
            orderClientId: saleOrder.orderClientId,
            date: saleOrder.orderClient?.createdAt.toLocaleDateString('es-BO'),
            status: saleOrder.orderClient?.status || 'desconocido',
            totalCost: saleOrder.totalCostOrder,
            items: saleOrder.saleProducts.map(sp => {
                // ✅ CORRECCIÓN: Acceder al precio a través del producto relacionado
                const unitPrice = sp.product?.pricePerUnit || 0; 
                return {
                    productId: sp.productId,
                    name: sp.product?.name || 'Producto no disponible',
                    imageUrl: sp.product?.imageUrl,
                    quantity: sp.quantity,
                    pricePerUnit: unitPrice, // Usar el precio obtenido
                    subtotal: sp.quantity * unitPrice // Calcular subtotal
                };
            })
        };

        return NextResponse.json({ order: orderDetails }, { status: 200 });

    } catch (error) {
        console.error(`Error al obtener detalle del pedido ${orderId}:`, error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}