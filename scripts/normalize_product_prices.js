const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const products = await prisma.product.findMany({ orderBy: { id: 'asc' } });
    console.log('Found', products.length, 'products. Showing before/after:');
    for (const p of products) {
      const before = p.pricePerUnit;
      const after = Math.round(before || 0);
      if (before !== after) {
        console.log(`- id=${p.id} name="${p.name}" before=${before} -> after=${after}`);
        await prisma.product.update({ where: { id: p.id }, data: { pricePerUnit: after } });
      } else {
        console.log(`- id=${p.id} name="${p.name}" price already integer: ${before}`);
      }
    }

    const updated = await prisma.product.findMany({ orderBy: { id: 'asc' } });
    console.log('\nFinal prices:');
    for (const p of updated) {
      console.log(`id=${p.id} name="${p.name}" price=${p.pricePerUnit}`);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
