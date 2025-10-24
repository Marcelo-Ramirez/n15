import { NextRequest, NextResponse } from 'next/server';
// ✅ 1. Importar tipos de Prisma (ajusta según tu configuración)
import { prisma } from '@/lib/db'; 
import { Prisma } from '@prisma/client';
// Tipo esperado del cuerpo de la petición POST (más específico que any)
interface EOQModelPostBody {
    ingredientId: string | number;
    annualDemand?: number | string;
    orderingCost?: number | string;
    annualMaintenanceCost?: number | string;
    reorderPoint?: number | string;
    leadTimeDays?: number | string;
    // Añade otros campos si los esperas
}

// POST: Guarda o actualiza un modelo EOQ para un ingrediente
export async function POST(req: NextRequest) {
  try {
    // Especificamos el tipo del cuerpo esperado
    const body: EOQModelPostBody = await req.json();
    const { 
        ingredientId, 
        annualDemand, 
        orderingCost, 
        annualMaintenanceCost, 
        reorderPoint, 
        leadTimeDays,
    } = body;

    if (!ingredientId) {
      return NextResponse.json({ error: 'Falta el id del ingrediente' }, { status: 400 });
    }

    const ingredientIdNum = Number(ingredientId);
    if (Number.isNaN(ingredientIdNum)) {
         return NextResponse.json({ error: 'El id del ingrediente debe ser un número válido' }, { status: 400 });
    }

    const updateData: Partial<Prisma.IngredientEOQModelUpdateInput> = {};
    // Convertir a número al asignar, si están definidos
    if (annualDemand !== undefined) updateData.annualDemand = Number(annualDemand);
    if (orderingCost !== undefined) updateData.orderingCost = Number(orderingCost);
    if (annualMaintenanceCost !== undefined) updateData.annualMaintenanceCost = Number(annualMaintenanceCost);
    if (reorderPoint !== undefined) updateData.reorderPoint = Number(reorderPoint);
    if (leadTimeDays !== undefined) updateData.leadTimeDays = Number(leadTimeDays);

    const createData: Prisma.IngredientEOQModelCreateInput = {
      ingredient: { 
          connect: { id: ingredientIdNum } 
      },
      annualDemand: Number(annualDemand ?? 0),
      orderingCost: Number(orderingCost ?? 0),
      annualMaintenanceCost: Number(annualMaintenanceCost ?? 0),
      leadTimeDays: Number(leadTimeDays ?? 0),
      // 'dailyDemand' debe venir del cálculo o guardarse también
      dailyDemand: 0, // O tomarlo del body si es parte del modelo guardado: Number(body.dailyDemand ?? 0)
      reorderPoint: Number(reorderPoint ?? 0),
    };

    const saved = await prisma.ingredientEOQModel.upsert({
      where: { idIngredient: ingredientIdNum },
      update: updateData,
      create: createData,
    });

    return NextResponse.json({ success: true, model: saved });

  } catch (err) {
    console.error("Error en POST /api/.../eoq-model:", err); 
    return NextResponse.json({ error: 'Error interno del servidor al guardar modelo EOQ' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const ingredientId = req.nextUrl.searchParams.get('ingredientId');
    if (!ingredientId) {
      return NextResponse.json({ error: 'Falta el id del ingrediente en los parámetros de búsqueda' }, { status: 400 });
    }

    const ingredientIdNum = Number(ingredientId);
     if (Number.isNaN(ingredientIdNum)) {
         return NextResponse.json({ error: 'El id del ingrediente debe ser un número válido' }, { status: 400 });
    }

    const model = await prisma.ingredientEOQModel.findUnique({
      where: { idIngredient: ingredientIdNum },
    });

     if (!model) {
         return NextResponse.json({ error: 'Modelo EOQ no encontrado para este ingrediente' }, { status: 404 });
     }

    return NextResponse.json({ model }); // Devuelve el modelo o null si no existe

  } catch (err) {
    console.error("Error en GET /api/.../eoq-model:", err); 
    return NextResponse.json({ error: 'Error interno del servidor al obtener modelo EOQ' }, { status: 500 });
  }
}