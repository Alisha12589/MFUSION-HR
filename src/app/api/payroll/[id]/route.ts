import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const payroll = await prisma.payroll.findUnique({
    where: { id },
    include: {
      employee: { include: { department: true } },
      items: { orderBy: { sortOrder: 'asc' } },
    },
  })
  if (!payroll) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(payroll)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const payroll = await prisma.payroll.update({
    where: { id },
    data: {
      status: body.status,
      paidAt: body.status === 'paid' ? new Date() : undefined,
    },
  })
  return NextResponse.json(payroll)
}
