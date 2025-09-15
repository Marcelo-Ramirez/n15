import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  // Aquí podrías conectar con Prisma y guardar los datos
  return NextResponse.json({ message: 'Clasificación ABC procesada' })
}