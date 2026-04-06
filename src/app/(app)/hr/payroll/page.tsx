import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, getThaiMonth } from '@/lib/utils'
import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'

export default async function PayrollPage() {
  const payrolls = await prisma.payroll.findMany({
    include: {
      employee: true,
      items: true,
    },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  })

  const statusLabel: Record<string, string> = {
    draft: 'ร่าง', approved: 'อนุมัติแล้ว', paid: 'จ่ายแล้ว'
  }
  const statusColor: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    approved: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
  }

  return (
    <div>
      <Header title="จัดการเงินเดือน" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-slate-500">รายการทั้งหมด {payrolls.length} รายการ</p>
          <Link
            href="/hr/payroll/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> สร้างรายการเงินเดือน
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left px-4 py-3 font-medium text-slate-600">พนักงาน</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">ประจำเดือน</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">เงินเดือนพื้นฐาน</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">รายการเพิ่ม</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">รายการหัก</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">สุทธิ</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">สถานะ</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">สลิป</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-12 text-slate-400">ยังไม่มีรายการ</td></tr>
                  ) : (
                    payrolls.map(p => {
                      const totalAdd = p.items.filter(i => i.type === 'addition').reduce((s, i) => s + i.amount, 0)
                      const totalDed = p.items.filter(i => i.type === 'deduction').reduce((s, i) => s + i.amount, 0)
                      return (
                        <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium">{p.employee.firstName} {p.employee.lastName}</td>
                          <td className="px-4 py-3 text-slate-600">{getThaiMonth(p.month)} {p.year + 543}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(p.baseSalary)}</td>
                          <td className="px-4 py-3 text-right text-green-600">{totalAdd > 0 ? formatCurrency(totalAdd) : '-'}</td>
                          <td className="px-4 py-3 text-right text-red-600">{totalDed > 0 ? formatCurrency(totalDed) : '-'}</td>
                          <td className="px-4 py-3 text-right font-bold">{formatCurrency(p.netSalary)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor[p.status]}`}>
                              {statusLabel[p.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Link href={`/hr/payroll/${p.id}/slip`} className="p-1.5 hover:bg-blue-100 rounded text-blue-600 inline-flex">
                              <FileText size={14} />
                            </Link>
                          </td>
                        </tr>
                      )
                    })
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
