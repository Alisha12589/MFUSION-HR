import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      name: 'ผู้ดูแลระบบ',
      password: hashedPassword,
      role: 'admin',
    },
  })

  // Create departments
  const depts = [
    { name: 'ฝ่ายบริหาร', description: 'บริหารและจัดการองค์กร' },
    { name: 'ฝ่ายบัญชี-การเงิน', description: 'บัญชีและการเงิน' },
    { name: 'ฝ่ายทรัพยากรบุคคล', description: 'HR และพัฒนาบุคลากร' },
    { name: 'ฝ่ายขาย', description: 'งานขายและการตลาด' },
    { name: 'ฝ่ายปฏิบัติการ', description: 'ปฏิบัติงานและโลจิสติกส์' },
  ]

  for (const dept of depts) {
    await prisma.department.upsert({
      where: { id: dept.name },
      update: {},
      create: dept,
    })
  }

  console.log('Seed completed!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
