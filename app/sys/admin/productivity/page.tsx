import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ProductivityPanel from '@/components/ProductivityPanel'
import { prisma } from '@/lib/db'

type ProductSummary = { productId: number; name: string; quantity: number; pricePerUnit: number; revenue: number };

async function computeMonthData(year: number, month: number) {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

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

  const sales = await prisma.saleProduct.findMany({ where: { createdAt: { gte: start, lte: end } }, include: { product: true } });
  let salesRevenue = 0;
  const byProduct: Record<string, ProductSummary> = {};
  for (const s of sales) {
    const price = s.product?.pricePerUnit ?? 0;
    const rev = (s.quantity || 0) * price;
    salesRevenue += rev;
    const key = String(s.productId);
    if (!byProduct[key]) byProduct[key] = { productId: s.productId, name: s.product?.name ?? 'N/A', quantity: 0, pricePerUnit: price, revenue: 0 };
    byProduct[key].quantity += s.quantity || 0;
    byProduct[key].revenue += rev;
  }

  return { rawMaterialCost, salesRevenue, products: Object.values(byProduct) as ProductSummary[], start, end };
}

export default async function ProductivityPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    // Not authenticated -> send to login
    redirect('/sys/login');
  }

  const role = (session as { role?: string } | null)?.role as string | undefined;
  if (role && role !== 'admin') {
    const pathRole = role === 'ventas' ? 'sales' : role === 'almacen' ? 'stockroom' : role;
    redirect(`/sys/${pathRole}/dashboard`);
  }

  const now = new Date();
  const initialData = await computeMonthData(now.getFullYear(), now.getMonth() + 1);

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Productividad</h1>
        </div>
      </div>

      <ProductivityPanel initialData={initialData} />
    </div>
  );
}
