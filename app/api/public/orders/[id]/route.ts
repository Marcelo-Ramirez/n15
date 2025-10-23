import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener pedido específico
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const paramsObj = await context.params;
    const orderId = parseInt(paramsObj.id);

    const order = await prisma.orderClient.findUnique({
      where: { id: orderId },
      include: {
        product: {
          select: {
            name: true,
            flavor: true,
            pricePerUnit: true,
            imageUrl: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
