import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. CORRECCIÓN: Usando Number.parseInt() en lugar de parseInt() global
    const userId = Number.parseInt(session.user.id, 10);
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    return NextResponse.json({ message: "2FA disabled successfully" });
  } catch (error: unknown) { 
    console.error("Error disabling 2FA:", error); 
    
    return NextResponse.json({ error: "Failed to disable 2FA" }, { status: 500 });
  }
}