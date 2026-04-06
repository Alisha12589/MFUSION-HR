import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function ExpensesPage() {
  const expenses = await prisma.expense.findMany({
    include: { supplier: true },
    orderBy: { date: 'desc' },
  })
  const total = expenses.reduce((s, e) => s + e.amount, 0)

  const statusLabel: Record<string, string> = { pending: 'รอดำเนินการ', approved: 'อนุมัติแล้ว', paid: 'จ่ายแล้ว' }
  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-blue-100 text-blue-700', paid: 'bg-green-100 text-green-700'
  }

  return (
    <div>
      <Header title="รายจ่าย" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500">{expenses.length} รายการ</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(total)}</p>
          </div>
          <Link href="/accounting/expenses/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Plus size={16} /> บันทึกรายจ่าย
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">เลขที่</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">วันที่</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">หมวดหมู่</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">รายละเอียด</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">ผู้จัดจำหน่าย</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">จำนวนเงิน</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400">ยังไม่มีรายการ</td></tr>
                ) : (
                  expenses.map(e => (
                    <tr key={e.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 text-blue-600 font-medium">{e.expenseNo}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDateShort(e.date)}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">{e.category}</span></td>
                      <td className="px-4 py-3">{e.description}</td>
                      <td className="px-4 py-3 text-slate-500">{e.supplier?.name || '-'}</td>
                      <td className="px-4 py-3 text-right font-bold text-red-600">{formatCurrency(e.amount)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor[e.status]}`}>
                          {statusLabel[e.status]}
                        </span>
                      </td>
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
