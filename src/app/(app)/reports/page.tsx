import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export default async function ReportsPage() {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const [
    totalIncome,
    totalExpense,
    monthlyIncome,
    monthlyExpense,
    employeeStats,
    invoiceStats,
  ] = await Promise.all([
    prisma.income.aggregate({ _sum: { amount: true } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.income.aggregate({
      where: { date: { gte: new Date(currentYear, currentMonth - 1, 1) } },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { date: { gte: new Date(currentYear, currentMonth - 1, 1) } },
      _sum: { amount: true },
    }),
    prisma.employee.groupBy({ by: ['status'], _count: true }),
    prisma.invoice.groupBy({ by: ['status'], _count: true, _sum: { total: true } }),
  ])

  const totalI = totalIncome._sum.amount || 0
  const totalE = totalExpense._sum.amount || 0
  const monthI = monthlyIncome._sum.amount || 0
  const monthE = monthlyExpense._sum.amount || 0

  return (
    <div>
      <Header title="รายงานภาพรวม" />
      <div className="p-6 space-y-6">
        {/* Financial Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'รายรับสะสม', value: formatCurrency(totalI), color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'รายจ่ายสะสม', value: formatCurrency(totalE), color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'กำไรสุทธิ', value: formatCurrency(totalI - totalE), color: totalI >= totalE ? 'text-green-600' : 'text-red-600', bg: totalI >= totalE ? 'bg-green-50' : 'bg-red-50' },
            { label: 'รายรับเดือนนี้', value: formatCurrency(monthI), color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map(s => (
            <Card key={s.label}><CardContent className={`p-4 ${s.bg} rounded-lg`}>
              <p className="text-sm text-slate-600">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent></Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Employee Stats */}
          <Card>
            <CardHeader><CardTitle className="text-base">สถิติพนักงาน</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employeeStats.map(s => (
                  <div key={s.status} className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">
                      {s.status === 'active' ? 'ทำงานอยู่' : s.status === 'inactive' ? 'หยุดชั่วคราว' : 'พ้นสภาพ'}
                    </span>
                    <span className="font-bold text-slate-800">{s._count} คน</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Invoice Stats */}
          <Card>
            <CardHeader><CardTitle className="text-base">สถิติใบแจ้งหนี้</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoiceStats.map(s => (
                  <div key={s.status} className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">
                      {s.status === 'draft' ? 'ร่าง' : s.status === 'sent' ? 'ส่งแล้ว' :
                       s.status === 'paid' ? 'ชำระแล้ว' : s.status === 'overdue' ? 'เกินกำหนด' : 'ยกเลิก'}
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-slate-800 mr-3">{s._count} ใบ</span>
                      <span className="text-sm text-slate-500">{formatCurrency(s._sum.total || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Comparison */}
        <Card>
          <CardHeader><CardTitle className="text-base">เดือนนี้ ({new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(new Date())})</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-slate-500">รายรับ</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(monthI)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">รายจ่าย</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(monthE)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">กำไร/ขาดทุน</p>
                <p className={`text-2xl font-bold ${monthI >= monthE ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(monthI - monthE)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
