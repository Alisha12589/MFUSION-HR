import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { formatDateShort } from '@/lib/utils'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function AttendancePage() {
  const attendances = await prisma.attendance.findMany({
    include: { employee: true },
    orderBy: { date: 'desc' },
    take: 100,
  })

  const statusLabel: Record<string, string> = {
    present: 'มาทำงาน', absent: 'ขาดงาน', late: 'มาสาย', leave: 'ลา', holiday: 'วันหยุด'
  }
  const statusColor: Record<string, string> = {
    present: 'bg-green-100 text-green-700', absent: 'bg-red-100 text-red-700',
    late: 'bg-yellow-100 text-yellow-700', leave: 'bg-blue-100 text-blue-700',
    holiday: 'bg-gray-100 text-gray-700',
  }

  return (
    <div>
      <Header title="การลงเวลา" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500">100 รายการล่าสุด</p>
          <Link href="/hr/attendance/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Plus size={16} /> บันทึกการเข้างาน
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">พนักงาน</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">วันที่</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">เวลาเข้า</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">เวลาออก</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">สถานะ</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {attendances.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400">ยังไม่มีข้อมูล</td></tr>
                ) : (
                  attendances.map(a => (
                    <tr key={a.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{a.employee.firstName} {a.employee.lastName}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDateShort(a.date)}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {a.checkIn ? new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit' }).format(new Date(a.checkIn)) : '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {a.checkOut ? new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit' }).format(new Date(a.checkOut)) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor[a.status]}`}>
                          {statusLabel[a.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{a.note || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
