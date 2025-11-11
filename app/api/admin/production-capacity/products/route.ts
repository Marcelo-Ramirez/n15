import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: { id: true, name: true, flavor: true, type: true, currentQuantity: true, pricePerUnit: true }
    });
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
