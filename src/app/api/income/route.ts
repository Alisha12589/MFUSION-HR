import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const income = await prisma.income.findMany({ orderBy: { date: 'desc' } })
  return NextResponse.json(income)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const count = await prisma.income.count()
  const income = await prisma.income.create({
    data: {
      incomeNo: body.incomeNo || `INC${String(count + 1).padStart(5, '0')}`,
      category: body.category,
      description: body.description,
      amount: parseFloat(body.amount),
      date: new Date(body.date),
      reference: body.reference || null,
      note: body.note || null,
    },
  })
  return NextResponse.json(income, { status: 201 })
}
