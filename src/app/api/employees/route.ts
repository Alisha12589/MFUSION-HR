import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const employees = await prisma.employee.findMany({
    include: { department: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(employees)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const employee = await prisma.employee.create({
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
      bankAccount: body.bankAccount || null,
      bankName: body.bankName || null,
      nationalId: body.nationalId || null,
      address: body.address || null,
    },
  })
  return NextResponse.json(employee, { status: 201 })
}
