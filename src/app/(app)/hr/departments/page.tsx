import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function DepartmentsPage() {
  const departments = await prisma.department.findMany({
    include: { _count: { select: { employees: true } } },
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <Header title="แผนก" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500">{departments.length} แผนก</p>
          <Link href="/hr/departments/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Plus size={16} /> เพิ่มแผนก
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {departments.map(dept => (
            <Card key={dept.id}>
              <CardContent className="p-4">
                <h3 className="font-semibold text-slate-800">{dept.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{dept.description || 'ไม่มีคำอธิบาย'}</p>
                <div className="mt-3 flex items-center gap-1 text-blue-600 text-sm font-medium">
                  <span>{dept._count.employees}</span>
                  <span className="text-slate-500 font-normal">พนักงาน</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
