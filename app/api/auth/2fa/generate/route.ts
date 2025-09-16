import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generate2FA } from "@/lib/twofactor/generate";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/twofactor/encrypt";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const userIdentifier = session.user.username || session.user.email || `user_${userId}`;

    console.log("Generating 2FA for user:", userIdentifier);

    // Generamos QR y secreto temporal
    const { secret, qrDataUrl } = await generate2FA(userIdentifier);

    console.log("Generated secret and QR code successfully");

    // Guardamos secret cifrado en DB, 2FA aún no activada
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: encrypt(secret), twoFactorEnabled: false },
    });

    console.log("Saved encrypted secret to database");

    return NextResponse.json({ qrDataUrl });
  } catch (error) {
    console.error("Error generating 2FA:", error);
    return NextResponse.json({ error: "Failed to generate 2FA" }, { status: 500 });
  }
}
