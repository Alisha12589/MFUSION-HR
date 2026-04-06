import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const expenses = await prisma.expense.findMany({
    include: { supplier: true },
    orderBy: { date: 'desc' },
  })
  return NextResponse.json(expenses)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const count = await prisma.expense.count()
  const expense = await prisma.expense.create({
    data: {
      expenseNo: body.expenseNo || `EXP${String(count + 1).padStart(5, '0')}`,
      supplierId: body.supplierId || null,
      category: body.category,
      description: body.description,
      amount: parseFloat(body.amount),
      date: new Date(body.date),
      note: body.note || null,
    },
  })
  return NextResponse.json(expense, { status: 201 })
}
