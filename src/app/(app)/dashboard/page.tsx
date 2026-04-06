import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Users, Receipt, ShoppingCart, TrendingUp, TrendingDown, FileText, Clock, DollarSign } from 'lucide-react'

async function getStats() {
  const [
    totalEmployees,
    activeEmployees,
    totalInvoices,
    paidInvoices,
    totalPO,
    totalIncome,
    totalExpenses,
    pendingPayroll,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { status: 'active' } }),
    prisma.invoice.count(),
    prisma.invoice.count({ where: { status: 'paid' } }),
    prisma.purchaseOrder.count(),
    prisma.income.aggregate({ _sum: { amount: true } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.payroll.count({ where: { status: 'draft' } }),
  ])

  return {
    totalEmployees,
    activeEmployees,
    totalInvoices,
    paidInvoices,
    totalPO,
    totalIncome: totalIncome._sum.amount || 0,
    totalExpenses: totalExpenses._sum.amount || 0,
    pendingPayroll,
  }
}

async function getRecentInvoices() {
  return prisma.invoice.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { customer: true },
  })
}

export default async function DashboardPage() {
  const stats = await getStats()
  const recentInvoices = await getRecentInvoices()
  const profit = stats.totalIncome - stats.totalExpenses

  const statCards = [
    {
      title: 'พนักงานทั้งหมด',
      value: stats.activeEmployees,
      sub: `${stats.totalEmployees} คนทั้งหมด`,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'ใบแจ้งหนี้',
      value: stats.totalInvoices,
      sub: `ชำระแล้ว ${stats.paidInvoices} ใบ`,
      icon: Receipt,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'รายรับรวม',
      value: formatCurrency(stats.totalIncome),
      sub: 'ยอดรวมทั้งหมด',
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'รายจ่ายรวม',
      value: formatCurrency(stats.totalExpenses),
      sub: 'ยอดรวมทั้งหมด',
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      title: 'กำไร/ขาดทุน',
      value: formatCurrency(profit),
      sub: profit >= 0 ? 'กำไรสุทธิ' : 'ขาดทุนสุทธิ',
      icon: DollarSign,
      color: profit >= 0 ? 'text-green-600' : 'text-red-600',
      bg: profit >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
    {
      title: 'เงินเดือนรอดำเนินการ',
      value: stats.pendingPayroll,
      sub: 'รายการรออนุมัติ',
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'ใบสั่งซื้อ',
      value: stats.totalPO,
      sub: 'รายการทั้งหมด',
      icon: ShoppingCart,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'ใบเสนอราคา',
      value: '-',
      sub: 'ดูรายละเอียด',
      icon: FileText,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
  ]

  const statusLabel: Record<string, string> = {
    draft: 'ร่าง',
    sent: 'ส่งแล้ว',
    paid: 'ชำระแล้ว',
    overdue: 'เกินกำหนด',
    cancelled: 'ยกเลิก',
  }

  const statusColor: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div>
      <Header title="แดชบอร์ด" />
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(card => (
            <Card key={card.title}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{card.title}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{card.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${card.bg}`}>
                    <card.icon size={20} className={card.color} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">ใบแจ้งหนี้ล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            {recentInvoices.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">ยังไม่มีข้อมูล</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-slate-500">เลขที่</th>
                    <th className="text-left py-2 font-medium text-slate-500">ลูกค้า</th>
                    <th className="text-left py-2 font-medium text-slate-500">วันที่</th>
                    <th className="text-right py-2 font-medium text-slate-500">ยอด</th>
                    <th className="text-center py-2 font-medium text-slate-500">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map(inv => (
                    <tr key={inv.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="py-2 font-medium text-blue-600">{inv.invoiceNo}</td>
                      <td className="py-2">{inv.customer.name}</td>
                      <td className="py-2 text-slate-500">
                        {new Intl.DateTimeFormat('th-TH').format(new Date(inv.issueDate))}
                      </td>
                      <td className="py-2 text-right font-medium">{formatCurrency(inv.total)}</td>
                      <td className="py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor[inv.status] || 'bg-gray-100'}`}>
                          {statusLabel[inv.status] || inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
