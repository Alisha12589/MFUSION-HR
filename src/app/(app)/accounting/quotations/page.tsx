import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Eye } from 'lucide-react'

export default async function QuotationsPage() {
  const quotations = await prisma.quotation.findMany({
    include: { customer: true },
    orderBy: { createdAt: 'desc' },
  })

  const statusLabel: Record<string, string> = {
    draft: 'ร่าง', sent: 'ส่งแล้ว', accepted: 'ยอมรับ', rejected: 'ปฏิเสธ', expired: 'หมดอายุ'
  }
  const statusColor: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700', sent: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700',
    expired: 'bg-orange-100 text-orange-700',
  }

  return (
    <div>
      <Header title="ใบเสนอราคา" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500">รายการทั้งหมด {quotations.length} ใบ</p>
          <Link href="/accounting/quotations/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Plus size={16} /> สร้างใบเสนอราคา
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
                    <th className="text-left px-4 py-3 font-medium text-slate-600">หมดอายุ</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">ยอดรวม</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">สถานะ</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-slate-400">ยังไม่มีใบเสนอราคา</td></tr>
                  ) : (
                    quotations.map(q => (
                      <tr key={q.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-blue-600">{q.quotationNo}</td>
                        <td className="px-4 py-3">{q.customer.name}</td>
                        <td className="px-4 py-3 text-slate-500">{formatDateShort(q.issueDate)}</td>
                        <td className="px-4 py-3 text-slate-500">{formatDateShort(q.validUntil)}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(q.total)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor[q.status]}`}>
                            {statusLabel[q.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Link href={`/accounting/quotations/${q.id}`} className="p-1.5 hover:bg-blue-100 rounded text-blue-600 inline-flex">
                            <Eye size={14} />
                          </Link>
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
