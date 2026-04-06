import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { generateDocNo } from '@/lib/utils'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pos = await prisma.purchaseOrder.findMany({
    include: { supplier: true, items: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(pos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const count = await prisma.purchaseOrder.count()

  const subtotal = body.items.reduce((s: number, i: any) => s + i.amount, 0)
  const discount = parseFloat(body.discount) || 0
  const taxRate = parseFloat(body.taxRate) || 0
  const tax = (subtotal - discount) * (taxRate / 100)
  const total = subtotal - discount + tax

  const po = await prisma.purchaseOrder.create({
    data: {
      poNo: body.poNo || generateDocNo('PO', count),
      supplierId: body.supplierId,
      orderDate: new Date(body.orderDate),
      deliverDate: body.deliverDate ? new Date(body.deliverDate) : null,
      subtotal,
      discount,
      tax,
      total,
      status: 'draft',
      note: body.note,
      items: {
        create: body.items.map((item: any) => ({
          description: item.description,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          amount: parseFloat(item.amount),
        })),
      },
    },
    include: { items: true },
  })
  return NextResponse.json(po, { status: 201 })
}
