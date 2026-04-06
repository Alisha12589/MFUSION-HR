import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const templates = await prisma.payrollItemTemplate.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json(templates)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const count = await prisma.payrollItemTemplate.count()
  const template = await prisma.payrollItemTemplate.create({
    data: {
      name: body.name,
      type: body.type,
      calcType: body.calcType,
      value: parseFloat(body.value) || 0,
      isActive: body.isActive ?? true,
      sortOrder: body.sortOrder ?? count,
      note: body.note || null,
    },
  })
  return NextResponse.json(template, { status: 201 })
}
