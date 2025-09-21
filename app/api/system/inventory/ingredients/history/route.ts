// POST /api/system/inventory/ingredients/history
export async function POST(request: NextRequest) {
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
    // Permitir solo a stockroom o admin
    if (!['stockroom', 'admin'].includes(sessionData.role)) {
      return NextResponse.json({ error: 'No tienes permisos' }, { status: 403 });
    }
    const body = await request.json();
    const { name, movementType, reason, quantity } = body;
    if (!name || !movementType || !reason || !quantity) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }
    // Buscar ingrediente
    const ingredient = await prisma.ingredient.findFirst({ where: { name } });
    if (!ingredient) {
      return NextResponse.json({ error: 'Ingrediente no encontrado' }, { status: 404 });
    }
    // Buscar usuario
    const user = await prisma.user.findUnique({ where: { id: sessionData.userId } });
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    // Registrar movimiento
    const movement = await prisma.inventoryMovement.create({
      data: {
        userId: user.id,
        ingredientId: ingredient.id,
        movementType,
        reason,
        quantity: movementType === 'salida' ? -Math.abs(quantity) : Math.abs(quantity),
      },
      select: {
        id: true,
        movementType: true,
        reason: true,
        quantity: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });
    // Actualizar stock del ingrediente
    await prisma.ingredient.update({
      where: { id: ingredient.id },
      data: {
        currentQuantity: ingredient.currentQuantity + movement.quantity
      }
    });
    return NextResponse.json({ success: true, movement });
  } catch (error) {
    console.error('Error al registrar movimiento:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// GET /api/system/inventory/ingredients/history?name=manzana
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
    // Permitir solo a stockroom o admin
    if (!['stockroom', 'admin'].includes(sessionData.role)) {
      return NextResponse.json({ error: 'No tienes permisos' }, { status: 403 });
    }
    // Obtener nombre del ingrediente
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    if (!name) {
      return NextResponse.json({ error: 'Falta el nombre del ingrediente' }, { status: 400 });
    }
    // Buscar ingrediente
    const ingredient = await prisma.ingredient.findFirst({
      where: { name },
      select: {
        id: true,
        name: true,
        provider: true,
        pricePerUnit: true,
        // Puedes agregar reorderPoint si existe en tu modelo
      },
    });
    if (!ingredient) {
      return NextResponse.json({ error: 'Ingrediente no encontrado' }, { status: 404 });
    }
    // Buscar movimientos
    const movements = await prisma.inventoryMovement.findMany({
      where: { ingredientId: ingredient.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        movementType: true,
        reason: true,
        quantity: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });
    return NextResponse.json({ success: true, ingredient, movements });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
