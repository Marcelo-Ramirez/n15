const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const quantity = 10;
  const now = new Date();

  // Find a client (cliente or demo) or fallback to first user
  let client = await prisma.user.findFirst({ where: { userName: 'cliente' } });
  if (!client) client = await prisma.user.findFirst({ where: { userName: 'demo' } });
  if (!client) client = await prisma.user.findFirst();

  // Find an admin user for the sale
  let admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!admin) admin = await prisma.user.findFirst();

  // Try to find product by name/flavor
  // Some Prisma providers don't support `mode: 'insensitive'` on contains — do a broader fetch and filter in JS
  const candidates = await prisma.product.findMany({ select: { id: true, name: true, flavor: true, type: true, imageUrl: true, pricePerUnit: true, currentQuantity: true } });
  let product = candidates.find(p => (p.name || '').toLowerCase().includes('cupcake') || (p.flavor || '').toLowerCase().includes('limon'));

  if (!product) {
    console.log('Producto "Cupcake de Limon" no existe, lo creo.');
    product = await prisma.product.create({ data: {
      name: 'Cupcake de Limon',
      flavor: 'Limon',
      type: 'cupcake',
      imageUrl: '/images/products/cupcakeLimon.png',
      pricePerUnit: 1.5,
      currentQuantity: 100,
    } });
  }

  // Create OrderClient
  const orderClient = await prisma.orderClient.create({ data: {
    clientId: client.id,
    productId: product.id,
    quantity: quantity,
    status: 'completed',
    createdAt: now,
  } });

  // Create SaleOrder referencing orderClient
  const saleOrder = await prisma.saleOrder.create({ data: {
    userId: admin.id,
    orderClientId: orderClient.id,
    totalCostOrder: product.pricePerUnit * quantity,
    createdAt: now,
  } });

  // Create SaleProduct
  const saleProduct = await prisma.saleProduct.create({ data: {
    userId: admin.id,
    productId: product.id,
    quantity: quantity,
    createdAt: now,
    saleOrderId: saleOrder.id,
  } });

  console.log('Insertado sale:', { orderClientId: orderClient.id, saleOrderId: saleOrder.id, saleProductId: saleProduct.id });
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
