import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST: Guarda un modelo EOQ para un ingrediente
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ingredientId, annualDemand, orderingCost, annualMaintenanceCost } = body;
    if (!ingredientId || annualDemand == null || orderingCost == null || annualMaintenanceCost == null) {
      return NextResponse.json({ error: 'Faltan datos para guardar el modelo EOQ' }, { status: 400 });
    }
    // Guarda o actualiza el modelo EOQ para el ingrediente
    const saved = await prisma.ingredientEOQModel.upsert({
      where: { idIngredient: Number(ingredientId) },
      update: { annualDemand, orderingCost, annualMaintenanceCost },
      create: {
        idIngredient: Number(ingredientId),
        annualDemand,
        orderingCost,
        annualMaintenanceCost,
        leadTimeDays: 0,
        dailyDemand: 0,
        reorderPoint: 0,
      },
    });
    return NextResponse.json({ success: true, model: saved });
  } catch (err) {
    return NextResponse.json({ error: 'Error al guardar modelo EOQ' }, { status: 500 });
  }
}

// GET: Obtiene el modelo EOQ guardado para un ingrediente
export async function GET(req: NextRequest) {
  try {
    const ingredientId = req.nextUrl.searchParams.get('ingredientId');
    if (!ingredientId) {
      return NextResponse.json({ error: 'Falta el id del ingrediente' }, { status: 400 });
    }
    const model = await prisma.ingredientEOQModel.findUnique({
      where: { idIngredient: Number(ingredientId) },
    });
    return NextResponse.json({ model });
  } catch (err) {
    return NextResponse.json({ error: 'Error al obtener modelo EOQ' }, { status: 500 });
  }
}
