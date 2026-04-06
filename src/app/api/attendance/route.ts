import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const attendances = await prisma.attendance.findMany({
    include: { employee: true },
    orderBy: { date: 'desc' },
    take: 200,
  })
  return NextResponse.json(attendances)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const dateStr = body.date
  const checkInTime = body.checkIn ? `${dateStr}T${body.checkIn}:00` : null
  const checkOutTime = body.checkOut ? `${dateStr}T${body.checkOut}:00` : null

  const attendance = await prisma.attendance.create({
    data: {
      employeeId: body.employeeId,
      date: new Date(dateStr),
      checkIn: checkInTime ? new Date(checkInTime) : null,
      checkOut: checkOutTime ? new Date(checkOutTime) : null,
      status: body.status,
      note: body.note || null,
    },
  })
  return NextResponse.json(attendance, { status: 201 })
}
