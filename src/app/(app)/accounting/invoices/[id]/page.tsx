import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Printer } from 'lucide-react'
import { InvoiceStatusButton } from './status-button'

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, items: true },
  })

  if (!invoice) notFound()

  const statusLabel: Record<string, string> = {
    draft: 'ร่าง', sent: 'ส่งแล้ว', paid: 'ชำระแล้ว', overdue: 'เกินกำหนด', cancelled: 'ยกเลิก'
  }
  const statusColor: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700', sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700', overdue: 'bg-red-100 text-red-700', cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div>
      <Header title={`ใบแจ้งหนี้ ${invoice.invoiceNo}`} />
      <div className="p-6 max-w-4xl space-y-4">
        <div className="flex items-center justify-between">
          <Link href="/accounting/invoices" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
            <ArrowLeft size={14} /> กลับ
          </Link>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[invoice.status]}`}>
              {statusLabel[invoice.status]}
            </span>
            <Link
              href={`/accounting/invoices/${id}/print`}
              className="inline-flex items-center gap-1.5 border border-slate-200 bg-white text-slate-600 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-50"
            >
              <Printer size={14} /> พิมพ์
            </Link>
            <InvoiceStatusButton invoiceId={id} currentStatus={invoice.status} />
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            {/* Header info */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">ลูกค้า</p>
                <p className="font-bold text-slate-800 text-lg">{invoice.customer.name}</p>
                {invoice.customer.taxId && <p className="text-sm text-slate-500">เลขภาษี: {invoice.customer.taxId}</p>}
                {invoice.customer.address && <p className="text-sm text-slate-500 mt-1">{invoice.customer.address}</p>}
              </div>
              <div className="text-right space-y-1 text-sm">
                <div><span className="text-slate-400">เลขที่:</span> <span className="font-semibold">{invoice.invoiceNo}</span></div>
                <div><span className="text-slate-400">วันที่ออก:</span> <span>{formatDate(invoice.issueDate)}</span></div>
                <div><span className="text-slate-400">ครบกำหนด:</span> <span className="text-red-600">{formatDate(invoice.dueDate)}</span></div>
              </div>
            </div>

            {/* Items table */}
            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left px-3 py-2 font-medium text-slate-600">รายการ</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">จำนวน</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">ราคา/หน่วย</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">รวม</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map(item => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-3 py-2">{item.description}</td>
                    <td className="px-3 py-2 text-right">{item.quantity.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>ราคารวม</span><span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>ส่วนลด</span><span className="text-red-600">-{formatCurrency(invoice.discount)}</span>
                  </div>
                )}
                {invoice.tax > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>ภาษีมูลค่าเพิ่ม</span><span>{formatCurrency(invoice.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>ยอดรวมสุทธิ</span>
                  <span className="text-blue-600">{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>

            {invoice.note && (
              <div className="mt-6 pt-4 border-t text-sm text-slate-500">
                <span className="font-medium text-slate-700">หมายเหตุ:</span> {invoice.note}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
