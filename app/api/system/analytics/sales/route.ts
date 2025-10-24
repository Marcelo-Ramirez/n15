import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener métricas de ventas
export async function GET() {
  try {
    // Ventas totales del mes actual
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const salesData = await prisma.saleOrder.findMany({
      where: {
        createdAt: { gte: currentMonth }
      },
      include: {
        user: {
          select: { name: true, userName: true }
        }
      }
    });

    // Calcular métricas
    const totalSales = salesData.reduce((sum, sale) => sum + sale.totalCostOrder, 0);
    const salesCount = salesData.length;
    const averageSale = salesCount > 0 ? totalSales / salesCount : 0;

    // Top productos vendidos
    const topProducts = await prisma.saleProduct.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    const metrics = {
      totalSales,
      salesCount,
      averageSale,
      topProducts,
      salesByDay: [] // Implementar agrupación por día
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
