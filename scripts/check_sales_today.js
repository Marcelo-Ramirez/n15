const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  return d;
}

function endOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23,59,59,999);
  return d;
}

async function main(){
  const start = startOfDay();
  const end = endOfDay();
  console.log('Checking sales between', start.toString(), 'and', end.toString());

  // find product
  const product = await prisma.product.findFirst({ where: { name: { contains: 'Cupcake de Limon' } } });
  console.log('Product found:', product ? `${product.name} (id=${product.id})` : 'not found');

  if (!product) {
    // list products with cupcake or limon
    const candidates = await prisma.product.findMany({ where: { OR: [ { name: { contains: 'cupcake' } }, { flavor: { contains: 'limon' } } ] }, take: 20 });
    console.log('Candidates:', candidates.map(c=>({id:c.id,name:c.name,flavor:c.flavor}))); 
  } else {
    const rows = await prisma.saleProduct.findMany({ where: { productId: product.id, createdAt: { gte: start, lte: end } }, orderBy: { createdAt: 'desc' } });
    console.log('SaleProduct rows today for product id', product.id, ':', rows.length);
    for (const r of rows) console.log(r);
    const agg = await prisma.saleProduct.aggregate({ _sum: { quantity: true }, where: { productId: product.id, createdAt: { gte: start, lte: end } } });
    console.log('Total sold today:', agg._sum.quantity || 0);
  }

  await prisma.$disconnect();
}

main().catch(e=>{ console.error(e); process.exit(1); });
