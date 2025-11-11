import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generate2FA } from "@/lib/twofactor/generate";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/twofactor/encrypt";

export async function POST(_req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const userIdentifier = session.user.userName || session.user.email || `user_${userId}`;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { secret, qrDataUrl } = await generate2FA(userIdentifier);

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: encrypt(secret) },
    });

    return NextResponse.json({ qrDataUrl });
  } catch (error) {
    console.error("Error generating 2FA:", error);
    return NextResponse.json({ error: "Failed to generate 2FA" }, { status: 500 });
  }
}