const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function startOfDay(date = new Date()) { const d = new Date(date); d.setHours(0,0,0,0); return d; }
function endOfDay(date = new Date()) { const d = new Date(date); d.setHours(23,59,59,999); return d; }

async function main(){
  const start = startOfDay();
  const end = endOfDay();
  console.log('Listing SaleProduct rows between', start.toString(), 'and', end.toString());
  const rows = await prisma.saleProduct.findMany({ where: { createdAt: { gte: start, lte: end } }, orderBy: { createdAt: 'desc' } });
  console.log('Total rows today:', rows.length);
  for (const r of rows) console.log(r);
  await prisma.$disconnect();
}

main().catch(e=>{ console.error(e); process.exit(1); });
