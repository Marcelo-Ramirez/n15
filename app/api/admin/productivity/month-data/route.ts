import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

type ProductSummary = { productId: number; name: string; quantity: number; pricePerUnit: number; revenue: number };

function startOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1, 0, 0, 0, 0);
}

function endOfMonth(year: number, month: number) {
  return new Date(year, month, 0, 23, 59, 59, 999);
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session as { role?: string } | null)?.role;
    if (!session || role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const url = new URL(req.url);
    const year = Number(url.searchParams.get('year')) || new Date().getFullYear();
    const month = Number(url.searchParams.get('month')) || (new Date().getMonth() + 1);

    const start = startOfMonth(year, month);
    const end = endOfMonth(year, month);

    // 1) Raw material cost: sum of inventory movements of type 'salida' and reason containing 'produccion' in that month
    const movs = await prisma.inventoryMovement.findMany({
      where: {
        movementType: 'salida',
        createdAt: { gte: start, lte: end },
        OR: [
          { reason: { contains: 'produccion' } },
          { reason: { contains: 'Producción' } },
          { reason: { contains: 'producción' } }
        ]
      },
      include: { ingredient: true }
    });

    let rawMaterialCost = 0;
    for (const m of movs) {
      const price = m.ingredient?.pricePerUnit ?? 0;
      rawMaterialCost += (m.quantity || 0) * price;
    }

    // 2) Sales revenue and per-product breakdown for the month
    const sales = await prisma.saleProduct.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { product: true }
    });

  let salesRevenue = 0;
  const byProduct: Record<string, ProductSummary> = {};

    for (const s of sales) {
      const price = s.product?.pricePerUnit ?? 0;
      const rev = (s.quantity || 0) * price;
      salesRevenue += rev;
      const key = String(s.productId);
      if (!byProduct[key]) {
        byProduct[key] = { productId: s.productId, name: s.product?.name ?? 'N/A', quantity: 0, pricePerUnit: price, revenue: 0 };
      }
      byProduct[key].quantity += s.quantity || 0;
      byProduct[key].revenue += rev;
    }

    const products = Object.values(byProduct);

    return NextResponse.json({ rawMaterialCost, salesRevenue, products, start, end });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
