import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/twofactor/encrypt";
import { verify2FA } from "@/lib/twofactor/verify";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const userId = Number(session.user.id);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: "2FA not initiated or user not found" }, { status: 400 });
    }

    const decryptedSecret = decrypt(user.twoFactorSecret);
    const isValid = verify2FA(token, decryptedSecret);

    if (isValid) {
      await prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: true },
      });
      return NextResponse.json({ message: "2FA enabled successfully" });
    } else {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error confirming 2FA:", error);
    return NextResponse.json({ error: "Failed to confirm 2FA" }, { status: 500 });
  }
}