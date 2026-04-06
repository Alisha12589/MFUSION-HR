import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' } })

  return (
    <div>
      <Header title="ลูกค้า" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500">{customers.length} บริษัท/บุคคล</p>
          <Link href="/contacts/customers/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Plus size={16} /> เพิ่มลูกค้า
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">รหัส</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">ชื่อ</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">เลขประจำตัวผู้เสียภาษี</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">อีเมล</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">เบอร์โทร</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">ผู้ติดต่อ</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400">ยังไม่มีข้อมูลลูกค้า</td></tr>
                ) : (
                  customers.map(c => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 text-blue-600 font-medium">{c.code}</td>
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-slate-500">{c.taxId || '-'}</td>
                      <td className="px-4 py-3 text-slate-500">{c.email || '-'}</td>
                      <td className="px-4 py-3 text-slate-500">{c.phone || '-'}</td>
                      <td className="px-4 py-3 text-slate-500">{c.contactName || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <Link href={`/contacts/customers/${c.id}/edit`} className="p-1.5 hover:bg-orange-100 rounded text-orange-600 inline-flex">
                          <Pencil size={14} />
                        </Link>
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
