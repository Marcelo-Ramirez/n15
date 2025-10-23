import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener todos los productos públicos
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        flavor: true,
        type: true,
        imageUrl: true,
        pricePerUnit: true,
        currentQuantity: true,
      },
      where: {
        currentQuantity: { gt: 0 } // Solo productos con stock
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo pedido (desde catálogo público)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { clientId, items } = data;

    // Validar que el cliente existe
    const client = await prisma.user.findUnique({
      where: { id: clientId, role: 'cliente' }
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Crear pedidos para cada producto
    const orders = await Promise.all(
      items.map(async (item: any) => {
        return await prisma.orderClient.create({
          data: {
            clientId: clientId,
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
