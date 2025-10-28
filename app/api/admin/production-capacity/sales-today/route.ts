import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');
    const type = url.searchParams.get('type');

    const start = startOfDay();
    const end = endOfDay();

    if (productId) {
      const id = Number(productId);
      const agg = await prisma.saleProduct.aggregate({
        _sum: { quantity: true },
        where: { productId: id, createdAt: { gte: start, lte: end } }
      });
      const total = agg._sum.quantity || 0;
      return NextResponse.json({ total });
    }

    if (type) {
      // get product ids by type
      const prods = await prisma.product.findMany({ where: { type }, select: { id: true } });
      const ids = prods.map(p => p.id);
      if (ids.length === 0) return NextResponse.json({ total: 0 });
      const agg = await prisma.saleProduct.aggregate({
        _sum: { quantity: true },
        where: { productId: { in: ids }, createdAt: { gte: start, lte: end } }
      });
      const total = agg._sum.quantity || 0;
      return NextResponse.json({ total });
    }

    // If no filters provided, return total across all saleProduct records for today
    const aggAll = await prisma.saleProduct.aggregate({
      _sum: { quantity: true },
      where: { createdAt: { gte: start, lte: end } }
    });
    const totalAll = aggAll._sum.quantity || 0;
    return NextResponse.json({ total: totalAll });
  } catch {
    return NextResponse.json({ error: 'Error calculating sales today' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
