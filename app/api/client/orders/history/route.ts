// app/api/orders/history/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; 

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const clientId = parseInt(session.user.id, 10);
    if (isNaN(clientId)) {
        return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 400 });
    }

    try {
        // Consultamos SaleOrder (la cabecera confirmada) e incluimos OrderClient para el estado
        const orders = await prisma.saleOrder.findMany({
            where: {
                userId: clientId, // Filtra por el cliente logueado
            },
            include: {
                orderClient: { // Para obtener el estado ('pendiente_verificacion', 'confirmado', 'entregado')
                    select: { status: true, id: true } 
                },
                _count: { // Contar cuántos productos tiene cada orden
                    select: { saleProducts: true }
                }
            },
            orderBy: {
                createdAt: 'desc', // Ordenar por fecha, más recientes primero
            }
        });

        // Mapeamos a un formato más simple para el frontend
        const formattedOrders = orders.map(order => ({
            id: order.id, // ID de la Venta (SaleOrder)
            orderClientId: order.orderClientId, // ID de la solicitud original
            date: order.createdAt.toLocaleDateString('es-BO'), // Formato de fecha local
            total: order.totalCostOrder,
            // Usamos el estado de OrderClient para el seguimiento
            status: order.orderClient?.status || 'desconocido', 
            itemCount: order._count.saleProducts,
        }));

        return NextResponse.json({ orders: formattedOrders }, { status: 200 });

    } catch (error) {
        console.error("Error al obtener historial de pedidos:", error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}