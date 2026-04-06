import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { generateDocNo } from '@/lib/utils'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const quotations = await prisma.quotation.findMany({
    include: { customer: true, items: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(quotations)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const count = await prisma.quotation.count()

  const subtotal = body.items.reduce((s: number, i: any) => s + i.amount, 0)
  const discount = parseFloat(body.discount) || 0
  const taxRate = parseFloat(body.taxRate) || 0
  const tax = (subtotal - discount) * (taxRate / 100)
  const total = subtotal - discount + tax

  const quotation = await prisma.quotation.create({
    data: {
      quotationNo: body.quotationNo || generateDocNo('QT', count),
      customerId: body.customerId,
      issueDate: new Date(body.issueDate),
      validUntil: new Date(body.validUntil),
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
  return NextResponse.json(quotation, { status: 201 })
}
