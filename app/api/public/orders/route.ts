import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// POST - Crear nuevo pedido
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user || session.user.role !== 'cliente') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { items } = data;

    // Crear pedidos para cada producto
    const clientId = Number(session.user.id);
    const orders = await Promise.all(
      items.map(async (item: any) => {
        return await prisma.orderClient.create({
          data: {
            clientId,
            productId: item.productId,
            quantity: item.quantity,
            status: 'pendiente'
          }
        });
      })
    );

    return NextResponse.json({ 
      message: 'Pedido creado exitosamente',
      orders 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET - Obtener pedidos del cliente
export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user || session.user.role !== 'cliente') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const clientId = Number(session.user.id);
    const orders = await prisma.orderClient.findMany({
      where: { clientId },
      include: {
        product: {
          select: {
            name: true,
            flavor: true,
            pricePerUnit: true,
            imageUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
