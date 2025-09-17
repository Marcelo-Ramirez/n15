import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db' // tu cliente de Prisma
import { ProductInput } from '@/types/product'

export async function GET() {
  const products = await prisma.product.findMany()
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const data: ProductInput = await req.json()

  const created = await prisma.product.create({
    data: {
      name: data.name,
      unitPrice: data.unitPrice,
      costPerUnit: data.costPerUnit,
      annualConsumption: data.annualConsumption,
    },
  })

  return NextResponse.json(created)
}
