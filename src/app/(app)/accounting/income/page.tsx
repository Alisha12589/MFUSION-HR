import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function IncomePage() {
  const incomes = await prisma.income.findMany({ orderBy: { date: 'desc' } })
  const total = incomes.reduce((s, i) => s + i.amount, 0)

  return (
    <div>
      <Header title="รายรับ" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500">{incomes.length} รายการ</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(total)}</p>
          </div>
          <Link href="/accounting/income/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Plus size={16} /> บันทึกรายรับ
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
                  <th className="text-right px-4 py-3 font-medium text-slate-600">จำนวนเงิน</th>
                </tr>
              </thead>
              <tbody>
                {incomes.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-400">ยังไม่มีรายการ</td></tr>
                ) : (
                  incomes.map(i => (
                    <tr key={i.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 text-blue-600 font-medium">{i.incomeNo}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDateShort(i.date)}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">{i.category}</span></td>
                      <td className="px-4 py-3">{i.description}</td>
                      <td className="px-4 py-3 text-right font-bold text-green-600">{formatCurrency(i.amount)}</td>
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
