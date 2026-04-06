import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const employee = await prisma.employee.findUnique({
    where: { id: params.id },
    include: { department: true },
  })
  if (!employee) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(employee)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const employee = await prisma.employee.update({
    where: { id: params.id },
    data: {
      employeeCode: body.employeeCode,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email || null,
      phone: body.phone || null,
      position: body.position,
      departmentId: body.departmentId || null,
      salary: body.salary,
      startDate: new Date(body.startDate),
      status: body.status,
      bankAccount: body.bankAccount || null,
      bankName: body.bankName || null,
      nationalId: body.nationalId || null,
      address: body.address || null,
    },
  })
  return NextResponse.json(employee)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.employee.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
