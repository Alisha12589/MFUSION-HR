import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Eye, FileText } from 'lucide-react'

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: { customer: true },
    orderBy: { createdAt: 'desc' },
  })

  const statusLabel: Record<string, string> = {
    draft: 'ร่าง', sent: 'ส่งแล้ว', paid: 'ชำระแล้ว', overdue: 'เกินกำหนด', cancelled: 'ยกเลิก'
  }
  const statusColor: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700', sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700', overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  const totalUnpaid = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled').reduce((s, i) => s + i.total, 0)
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0)

  return (
    <div>
      <Header title="ใบแจ้งหนี้ / ใบวางบิล" />
      <div className="p-6 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'ทั้งหมด', value: invoices.length + ' ใบ', color: 'text-slate-800' },
            { label: 'ยอดคงค้าง', value: formatCurrency(totalUnpaid), color: 'text-orange-600' },
            { label: 'ชำระแล้ว', value: formatCurrency(totalPaid), color: 'text-green-600' },
          ].map(s => (
            <Card key={s.label}><CardContent className="p-4">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent></Card>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500">รายการทั้งหมด {invoices.length} ใบ</p>
          <Link href="/accounting/invoices/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Plus size={16} /> สร้างใบแจ้งหนี้
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left px-4 py-3 font-medium text-slate-600">เลขที่</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">ลูกค้า</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">วันที่ออก</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">ครบกำหนด</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">ยอดรวม</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">สถานะ</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-slate-400">ยังไม่มีใบแจ้งหนี้</td></tr>
                  ) : (
                    invoices.map(inv => (
                      <tr key={inv.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-blue-600">{inv.invoiceNo}</td>
                        <td className="px-4 py-3">{inv.customer.name}</td>
                        <td className="px-4 py-3 text-slate-500">{formatDateShort(inv.issueDate)}</td>
                        <td className="px-4 py-3 text-slate-500">{formatDateShort(inv.dueDate)}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(inv.total)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor[inv.status]}`}>
                            {statusLabel[inv.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-2">
                            <Link href={`/accounting/invoices/${inv.id}`} className="p-1.5 hover:bg-blue-100 rounded text-blue-600">
                              <Eye size={14} />
                            </Link>
                            <Link href={`/accounting/invoices/${inv.id}/print`} className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
                              <FileText size={14} />
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
