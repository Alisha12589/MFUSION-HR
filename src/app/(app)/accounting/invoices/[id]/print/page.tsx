import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PrintButton } from './print-button'

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, items: true },
  })

  if (!invoice) notFound()

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Toolbar - hidden when printing */}
      <div className="print:hidden bg-white border-b px-6 py-3 flex items-center justify-between">
        <Link href={`/accounting/invoices/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft size={14} /> กลับ
        </Link>
        <PrintButton />
      </div>

      {/* Printable document */}
      <div className="p-8 print:p-0">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm print:shadow-none print:rounded-none p-10">
          {/* Company header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-slate-200">
            <div>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mb-2">ERP</div>
              <h1 className="font-bold text-slate-800 text-lg">บริษัท ตัวอย่าง จำกัด</h1>
              <p className="text-slate-500 text-sm">123 ถนนตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพฯ 10000</p>
              <p className="text-slate-500 text-sm">โทร: 02-xxx-xxxx | อีเมล: info@company.com</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-700 uppercase tracking-wide">Invoice</p>
              <p className="text-slate-500 text-sm">ใบแจ้งหนี้ / ใบวางบิล</p>
              <p className="text-lg font-bold text-slate-800 mt-1">{invoice.invoiceNo}</p>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">ออกให้แก่</p>
              <p className="font-bold text-slate-800">{invoice.customer.name}</p>
              {invoice.customer.taxId && <p className="text-slate-500">เลขประจำตัวผู้เสียภาษี: {invoice.customer.taxId}</p>}
              {invoice.customer.address && <p className="text-slate-500 mt-1 leading-relaxed">{invoice.customer.address}</p>}
              {invoice.customer.phone && <p className="text-slate-500">โทร: {invoice.customer.phone}</p>}
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">วันที่ออก</span>
                <span className="font-medium">{formatDate(invoice.issueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ครบกำหนด</span>
                <span className="font-medium text-red-600">{formatDate(invoice.dueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">สถานะ</span>
                <span className={`font-medium ${invoice.status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                  {invoice.status === 'paid' ? 'ชำระแล้ว' : invoice.status === 'sent' ? 'รอชำระ' : invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Items */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="bg-slate-700 text-white">
                <th className="text-left px-3 py-2 rounded-tl">#</th>
                <th className="text-left px-3 py-2">รายการ</th>
                <th className="text-right px-3 py-2">จำนวน</th>
                <th className="text-right px-3 py-2">ราคา/หน่วย</th>
                <th className="text-right px-3 py-2 rounded-tr">รวม</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                  <td className="px-3 py-2">{item.description}</td>
                  <td className="px-3 py-2 text-right">{item.quantity.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-60 space-y-2 text-sm">
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
              <div className="flex justify-between font-bold text-base border-t-2 border-slate-700 pt-2">
                <span>ยอดรวมสุทธิ</span>
                <span className="text-blue-700 text-lg">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {invoice.note && (
            <div className="mb-8 p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
              <span className="font-medium">หมายเหตุ:</span> {invoice.note}
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-12 mt-12 text-sm text-center text-slate-600">
            <div>
              <div className="border-t border-slate-300 pt-2 mt-12">ผู้รับเงิน / Received by</div>
            </div>
            <div>
              <div className="border-t border-slate-300 pt-2 mt-12">ผู้อนุมัติ / Authorized by</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
