import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: 'asc' } })

  return (
    <div>
      <Header title="ผู้จัดจำหน่าย" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500">{suppliers.length} บริษัท/บุคคล</p>
          <Link href="/contacts/suppliers/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Plus size={16} /> เพิ่มผู้จัดจำหน่าย
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
                  <th className="text-center px-4 py-3 font-medium text-slate-600">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400">ยังไม่มีข้อมูล</td></tr>
                ) : (
                  suppliers.map(s => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 text-blue-600 font-medium">{s.code}</td>
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-slate-500">{s.taxId || '-'}</td>
                      <td className="px-4 py-3 text-slate-500">{s.email || '-'}</td>
                      <td className="px-4 py-3 text-slate-500">{s.phone || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <Link href={`/contacts/suppliers/${s.id}/edit`} className="p-1.5 hover:bg-orange-100 rounded text-orange-600 inline-flex">
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
