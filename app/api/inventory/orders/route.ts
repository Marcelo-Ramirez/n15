import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Tipos
type OrderItem = {
  productId: number;
  quantity: number;
};

type CreateOrderBody = {
  userId: number;
  items: OrderItem[];
};

// ---------------------------
// POST - Crear pedidos
// ---------------------------
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateOrderBody;
    const { userId, items } = body;

    if (!userId || !items || !items.length) {
      return NextResponse.json(
        { success: false, error: "Datos incompletos" },
        { status: 400 }
      );
    }

    const orders = await Promise.all(
      items.map((item: OrderItem) =>
        prisma.orderClient.create({
          data: {
            userId,
            productId: item.productId,
            quantity: item.quantity,
            status: "pendiente",
          },
        })
      )
    );

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Error creando pedidos:", error);
    return NextResponse.json(
      { success: false, error: (error as any).message },
      { status: 500 }
    );
  }
}

// ---------------------------
// GET - Listar pedidos
// ---------------------------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const whereClause = userId ? { userId: parseInt(userId) } : undefined;

    const orders = await prisma.orderClient.findMany({
      where: whereClause,
      include: {
        product: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Error listando pedidos:", error);
    return NextResponse.json(
      { success: false, error: (error as any).message },
      { status: 500 }
    );
  }
}
