import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const ingredientId = req.nextUrl.searchParams.get('ingredientId');
    if (!ingredientId) {
      return NextResponse.json({ error: 'Falta el id del ingrediente' }, { status: 400 });
    }
    // Obtener movimientos de salida por producción del último año
    const now = new Date();
    const lastYear = new Date(now);
    lastYear.setFullYear(now.getFullYear() - 1);
    const movements = await prisma.inventoryMovement.findMany({
      where: {
        ingredientId: Number(ingredientId),
        movementType: 'salida', // <-- corregido
        reason: 'produccion',   // <-- corregido
        createdAt: {
          gte: lastYear,
          lte: now,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Debug: mostrar movimientos encontrados
    console.log('Movements:', movements);

    if (!movements.length) {
      console.log('No movements found');
      return NextResponse.json({ dailyDemand: 0 });
    }
    // Sumar todas las salidas (valor absoluto)
    const total = movements.reduce((a, b) => a + Math.abs(b.quantity), 0);
    console.log('Total quantity:', total);

    // Calcular días distintos entre primer y último registro (inclusive)
    const first = new Date(movements[0].createdAt).getTime();
    const last = new Date(movements[movements.length - 1].createdAt).getTime();
    console.log('First date:', movements[0].createdAt, '->', first);
    console.log('Last date:', movements[movements.length - 1].createdAt, '->', last);

    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.floor((last - first) / msPerDay) + 1;
    const divisor = days > 0 ? days : 1;
    console.log('Days:', days, 'Divisor:', divisor);

    const dailyDemand = total / divisor;
    console.log('DailyDemand:', dailyDemand);

    return NextResponse.json({ dailyDemand, debug: { total, days, divisor, first: movements[0].createdAt, last: movements[movements.length - 1].createdAt } });
  } catch (err) {
    console.error('Error en daily-demand:', err);
    return NextResponse.json({ error: 'Error al calcular demanda diaria' }, { status: 500 });
  }
}
