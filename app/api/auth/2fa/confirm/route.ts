import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {  encrypt } from "@/lib/twofactor/encrypt";
import { verify2FA } from "@/lib/twofactor/verify";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const { token, secret } = body;
  const isValid = verify2FA(token, secret);

  if (!isValid) return new NextResponse("Invalid token", { status: 400 });

  const encryptedSecret = encrypt(secret);

  await prisma.user.update({
    where: { id: Number(session.user?.id) },
    data: {
      twoFactorSecret: encryptedSecret,
      twoFactorEnabled: true,
    },
  });

  return NextResponse.json({ success: true });
}
