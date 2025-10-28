// app/api/orders/pending/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // Adjust path if needed
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Adjust path if needed

export async function GET() {
    const session = await getServerSession(authOptions);

    // 1. Verify session
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 2. Get and validate client ID
    const clientId = parseInt(session.user.id, 10);
    if (isNaN(clientId)) {
        return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 400 });
    }

    try {
        // 3. Query the database for SaleOrders linked to the client
        //    CORRECCIÓN: Incluir solo los 3 estados principales.
        const ordersHistory = await prisma.saleOrder.findMany({
            where: {
                userId: clientId, // Filter by the logged-in user
                orderClient: { // Filter based on the related OrderClient's status
                    status: {
                        in: [
                            'pendiente_verificacion', // Pendiente / Revisar Pago
                            'reservado',              // Reservado
                            'completado'              // Completado
                        ]
                    }
                }
            },
            include: {
                orderClient: { // Include OrderClient to get the exact status and creation date
                    select: { status: true, createdAt: true, id: true }
                },
                _count: { // Count related SaleProducts
                    select: { saleProducts: true }
                }
            },
            orderBy: {
                createdAt: 'desc', // Show newest pending orders first
            }
        });

        // 4. Format the data for the frontend
        // Nota: La variable ordersHistory ahora contiene todas las órdenes del historial.
        const formattedOrders = ordersHistory.map(order => ({
            id: order.id, // SaleOrder ID
            orderClientId: order.orderClientId, // OrderClient ID
            // Use OrderClient's creation date for consistency
            date: order.orderClient?.createdAt.toLocaleDateString('es-BO') || 'Fecha desconocida',
            total: order.totalCostOrder,
            status: order.orderClient?.status || 'desconocido', // Now shows the actual status
            itemCount: order._count.saleProducts,
        }));

        return NextResponse.json({ orders: formattedOrders }, { status: 200 });

    } catch (error) {
        console.error("Error fetching orders history:", error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}