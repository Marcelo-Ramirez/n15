import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener categorías de productos
export async function GET() {
  try {
    // Obtener tipos únicos de productos como categorías
    const categories = await prisma.product.findMany({
      select: {
        type: true,
      },
      distinct: ['type']
    });

    const categoryList = categories.map(cat => ({
      name: cat.type,
      slug: cat.type.toLowerCase().replace(/\s+/g, '-')
    }));

    return NextResponse.json(categoryList);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
