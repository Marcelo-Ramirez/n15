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
        movementType: 'output',
        reason: 'production',
        createdAt: {
          gte: lastYear,
          lte: now,
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    if (!movements.length) {
      return NextResponse.json({ dailyDemand: 0 });
    }
  // Sumar todas las salidas
  const total = movements.reduce((a, b) => a + b.quantity, 0);
  // Calcular días distintos entre primer y último registro (inclusive)
  const first = new Date(movements[0].createdAt).getTime();
  const last = new Date(movements[movements.length - 1].createdAt).getTime();
  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.floor((last - first) / msPerDay) + 1;
  const divisor = days > 0 ? days : 1;
  const dailyDemand = total / divisor;
  return NextResponse.json({ dailyDemand });
  } catch (err) {
    return NextResponse.json({ error: 'Error al calcular demanda diaria' }, { status: 500 });
  }
}
