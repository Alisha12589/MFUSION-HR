import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'กรุณากรอกอีเมล' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ' }, { status: 404 })
  }

  // In a real app you'd send an email here.
  // For this internal system, we just confirm the user exists so admin can reset manually.
  return NextResponse.json({ success: true })
}
