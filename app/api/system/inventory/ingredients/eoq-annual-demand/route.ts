import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// GET /api/system/inventory/ingredients/eoq-annual-demand?ingredientId=ID
export async function GET(request: NextRequest) {
  try {
    // Verificar sesión desde cookies
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
    }
    if (!['stockroom', 'admin'].includes(sessionData.role)) {
      return NextResponse.json({ error: 'No tienes permisos' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const ingredientId = searchParams.get('ingredientId');
    if (!ingredientId) {
      return NextResponse.json({ error: 'Falta el id del ingrediente' }, { status: 400 });
    }
    // Calcular fecha hace 1 año
    const now = new Date();
    const lastYear = new Date(now);
    lastYear.setFullYear(now.getFullYear() - 1);
    // Sumar todas las salidas a produccion del último año
    const movements = await prisma.inventoryMovement.findMany({
      where: {
        ingredientId: parseInt(ingredientId),
        movementType: 'salida',
        reason: 'produccion',
        createdAt: {
          gte: lastYear,
          lte: now
        }
      }
    });
    const annualDemand = movements.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    return NextResponse.json({ success: true, annualDemand });
  } catch (error) {
    console.error('Error al calcular demanda anual:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
