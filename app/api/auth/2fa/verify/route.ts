import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/twofactor/encrypt";
import { verify2FA } from "@/lib/twofactor/verify";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await req.json();
  const userId = Number(session.user.id);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.twoFactorSecret) {
    return new NextResponse("2FA not enabled", { status: 400 });
  }

  const secret = decrypt(user.twoFactorSecret);
  const isValid = verify2FA(token, secret);

  if (!isValid) return new NextResponse("Invalid token", { status: 400 });

  // Activamos 2FA en la DB
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: true },
  });

  return NextResponse.json({ success: true });
}
