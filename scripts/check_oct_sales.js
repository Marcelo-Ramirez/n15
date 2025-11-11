const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const start = new Date(2025, 9, 1);
    const end = new Date(2025, 9 + 1, 0, 23, 59, 59, 999);
    const rows = await prisma.saleProduct.findMany({ where: { createdAt: { gte: start, lte: end } }, include: { product: true } });
    console.log('query range', start.toISOString(), end.toISOString());
    console.log('rows', rows.length);
    rows.slice(0, 20).forEach(r => console.log({ id: r.id, productId: r.productId, quantity: r.quantity, createdAt: r.createdAt }));
  } catch (e) { console.error(e); process.exit(1); } finally { await prisma.$disconnect(); }
})();
