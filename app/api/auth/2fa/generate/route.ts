import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generate2FA } from "@/lib/twofactor/generate";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/twofactor/encrypt";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);

  // Generamos QR y secreto temporal
  const { secret, qrDataUrl } = await generate2FA(session.user.username!);

  // Guardamos secret cifrado en DB, 2FA aún no activada
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: encrypt(secret), twoFactorEnabled: false },
  });

  return NextResponse.json({ qrDataUrl });
}
