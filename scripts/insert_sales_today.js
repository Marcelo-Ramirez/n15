const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Inserts several sale orders/products for 'today' across existing products.
async function main() {
  try {
    const products = await prisma.product.findMany({ select: { id: true, name: true } });
    if (products.length === 0) {
      console.log('No products found in DB. Aborting.');
      return;
    }

    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No users found. Aborting.');
      return;
    }

    const toInsert = [];
    // create a few sale orders with sale products
    const now = new Date();

    // We'll insert 5 sale orders, each with 1-3 saleProducts randomized
    for (let i = 0; i < 5; i++) {
      const orderClient = await prisma.orderClient.create({
        data: {
          clientId: user.id,
          productId: products[i % products.length].id,
          quantity: 1,
          status: 'ready'
        }
      });

      const saleOrder = await prisma.saleOrder.create({
        data: {
          userId: user.id,
          orderClientId: orderClient.id,
          totalCostOrder: 0
        }
      });

      const count = 1 + Math.floor(Math.random() * 3);
      for (let j = 0; j < count; j++) {
        const p = products[(i + j) % products.length];
        const qty = 1 + Math.floor(Math.random() * 10);
        const sp = await prisma.saleProduct.create({
          data: {
            userId: user.id,
            productId: p.id,
            quantity: qty,
            saleOrderId: saleOrder.id,
            createdAt: now
          }
        });
        toInsert.push(sp);
      }
    }

    console.log('Inserted saleProduct rows:', toInsert.length);
    toInsert.forEach(r => console.log({ id: r.id, productId: r.productId, quantity: r.quantity, createdAt: r.createdAt }));
  } catch (err) {
    console.error('Error inserting sales today', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
