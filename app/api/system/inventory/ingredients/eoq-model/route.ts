import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST: Guarda un modelo EOQ para un ingrediente
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ingredientId, annualDemand, orderingCost, annualMaintenanceCost, reorderPoint, leadTimeDays } = body;
    if (!ingredientId) {
      return NextResponse.json({ error: 'Falta el id del ingrediente' }, { status: 400 });
    }
    // Construir objeto de actualización solo con los campos presentes
    const updateData: any = {};
    if (annualDemand !== undefined) updateData.annualDemand = annualDemand;
    if (orderingCost !== undefined) updateData.orderingCost = orderingCost;
    if (annualMaintenanceCost !== undefined) updateData.annualMaintenanceCost = annualMaintenanceCost;
    if (reorderPoint !== undefined) updateData.reorderPoint = reorderPoint;
    if (leadTimeDays !== undefined) updateData.leadTimeDays = leadTimeDays;

    const createData: any = {
      idIngredient: Number(ingredientId),
      annualDemand: annualDemand ?? 0,
      orderingCost: orderingCost ?? 0,
      annualMaintenanceCost: annualMaintenanceCost ?? 0,
      leadTimeDays: leadTimeDays ?? 0,
      dailyDemand: 0,
      reorderPoint: reorderPoint ?? 0,
    };

    const saved = await prisma.ingredientEOQModel.upsert({
      where: { idIngredient: Number(ingredientId) },
      update: updateData,
      create: createData,
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
