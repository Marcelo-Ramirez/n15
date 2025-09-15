import { NextRequest, NextResponse } from "next/server";
import { verifyUser } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const user = await verifyUser(username, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({ requires2FA: !!user.twoFactorEnabled });
  } catch (error) {
    console.error("❌ [Check Credentials]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
