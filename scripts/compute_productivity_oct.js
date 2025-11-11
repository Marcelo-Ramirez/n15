const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const start = new Date(2025, 9, 1, 0, 0, 0, 0);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);

    const sales = await prisma.saleProduct.findMany({ where: { createdAt: { gte: start, lte: end } }, include: { product: true } });
    const byProd = {};
    let salesRevenue = 0;
    for (const s of sales) {
      const price = s.product?.pricePerUnit || 0;
      const rev = (s.quantity || 0) * price;
      salesRevenue += rev;
      const key = String(s.productId);
      if (!byProd[key]) byProd[key] = { productId: s.productId, name: s.product?.name ?? 'N/A', quantity: 0, pricePerUnit: price, revenue: 0 };
      byProd[key].quantity += s.quantity || 0;
      byProd[key].revenue += rev;
    }

    const movs = await prisma.inventoryMovement.findMany({ where: { movementType: 'salida', createdAt: { gte: start, lte: end }, OR: [{ reason: { contains: 'produccion' } }, { reason: { contains: 'Producción' } }, { reason: { contains: 'producción' } }] }, include: { ingredient: true } });
    let rawMP = 0;
    for (const m of movs) {
      const price = m.ingredient?.pricePerUnit || 0;
      // normalize quantity to absolute to reflect cost of materials used in production
      rawMP += Math.abs(m.quantity || 0) * price;
    }

    console.log('range', start.toISOString(), end.toISOString());
    console.log('salesRevenue', salesRevenue);
    console.log('rawMaterialCost', rawMP);
    console.log('products', Object.values(byProd));
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
