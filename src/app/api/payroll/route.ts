import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payrolls = await prisma.payroll.findMany({
    include: { employee: { include: { department: true } }, items: true },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  })
  return NextResponse.json(payrolls)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { employeeId, month, year, items = [], note } = body

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
  if (!employee) return NextResponse.json({ error: 'Employee not found' }, { status: 404 })

  const baseSalary = employee.salary

  // Compute netSalary from items
  const totalAdditions = (items as any[])
    .filter(i => i.type === 'addition')
    .reduce((sum: number, i: any) => sum + (parseFloat(i.amount) || 0), 0)
  const totalDeductions = (items as any[])
    .filter(i => i.type === 'deduction')
    .reduce((sum: number, i: any) => sum + (parseFloat(i.amount) || 0), 0)

  const netSalary = baseSalary + totalAdditions - totalDeductions

  const payroll = await prisma.payroll.create({
    data: {
      employeeId,
      month: parseInt(month),
      year: parseInt(year),
      baseSalary,
      netSalary,
      note: note || null,
      status: 'draft',
      items: {
        create: (items as any[]).map((item: any) => ({
          templateId: item.templateId || null,
          name: item.name,
          type: item.type,
          amount: parseFloat(item.amount) || 0,
          sortOrder: item.sortOrder ?? 0,
        })),
      },
    },
    include: { items: true },
  })
  return NextResponse.json(payroll, { status: 201 })
}
