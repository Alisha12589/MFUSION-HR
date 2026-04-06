import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { generateDocNo } from '@/lib/utils'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const invoices = await prisma.invoice.findMany({
    include: { customer: true, items: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(invoices)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const count = await prisma.invoice.count()

  const subtotal = body.items.reduce((s: number, i: any) => s + i.amount, 0)
  const discount = parseFloat(body.discount) || 0
  const taxRate = parseFloat(body.taxRate) || 0
  const tax = (subtotal - discount) * (taxRate / 100)
  const total = subtotal - discount + tax

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNo: body.invoiceNo || generateDocNo('INV', count),
      customerId: body.customerId,
      issueDate: new Date(body.issueDate),
      dueDate: new Date(body.dueDate),
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
  return NextResponse.json(invoice, { status: 201 })
}
