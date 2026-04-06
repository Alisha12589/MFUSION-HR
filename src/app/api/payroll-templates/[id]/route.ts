import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const template = await prisma.payrollItemTemplate.update({
    where: { id },
    data: {
      name: body.name,
      type: body.type,
      calcType: body.calcType,
      value: parseFloat(body.value) || 0,
      isActive: body.isActive,
      sortOrder: body.sortOrder,
      note: body.note ?? null,
    },
  })
  return NextResponse.json(template)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.payrollItemTemplate.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
