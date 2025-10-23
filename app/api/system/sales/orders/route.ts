import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const orders = await prisma.orderClient.findMany({
    include: {
      product: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ orders });
}
