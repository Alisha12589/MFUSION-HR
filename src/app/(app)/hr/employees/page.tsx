import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Pencil, Eye } from 'lucide-react'

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    include: { department: true },
    orderBy: { createdAt: 'desc' },
  })

  const statusLabel: Record<string, string> = {
    active: 'ทำงานอยู่',
    inactive: 'หยุดชั่วคราว',
    terminated: 'พ้นสภาพ',
  }
  const statusColor: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-yellow-100 text-yellow-700',
    terminated: 'bg-red-100 text-red-700',
  }

  return (
    <div>
      <Header title="จัดการพนักงาน" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-slate-500">พนักงานทั้งหมด {employees.length} คน</p>
          <Link
            href="/hr/employees/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> เพิ่มพนักงาน
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left px-4 py-3 font-medium text-slate-600">รหัส</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">ชื่อ-นามสกุล</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">ตำแหน่ง</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">แผนก</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">เงินเดือน</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">วันเริ่มงาน</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">สถานะ</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400">
                        ยังไม่มีข้อมูลพนักงาน
                      </td>
                    </tr>
                  ) : (
                    employees.map(emp => (
                      <tr key={emp.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-blue-600">{emp.employeeCode}</td>
                        <td className="px-4 py-3 font-medium">{emp.firstName} {emp.lastName}</td>
                        <td className="px-4 py-3 text-slate-600">{emp.position}</td>
                        <td className="px-4 py-3 text-slate-600">{emp.department?.name || '-'}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(emp.salary)}</td>
                        <td className="px-4 py-3 text-slate-500">{formatDateShort(emp.startDate)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor[emp.status] || 'bg-gray-100'}`}>
                            {statusLabel[emp.status] || emp.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-2">
                            <Link href={`/hr/employees/${emp.id}`} className="p-1.5 hover:bg-blue-100 rounded text-blue-600">
                              <Eye size={14} />
                            </Link>
                            <Link href={`/hr/employees/${emp.id}/edit`} className="p-1.5 hover:bg-orange-100 rounded text-orange-600">
                              <Pencil size={14} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
