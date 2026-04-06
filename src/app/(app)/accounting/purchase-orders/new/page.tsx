'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { DocumentForm } from '@/components/forms/document-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewPOPage() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/suppliers').then(r => r.json()).then(setSuppliers)
  }, [])

  return (
    <div>
      <Header title="สร้างใบสั่งซื้อใหม่" />
      <div className="p-6">
        <Link href="/accounting/purchase-orders" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4">
          <ArrowLeft size={14} /> กลับ
        </Link>
        <DocumentForm
          title="รายละเอียดใบสั่งซื้อ"
          contacts={suppliers}
          contactLabel="ผู้จัดจำหน่าย"
          contactField="supplierId"
          dateLabel="วันที่สั่งซื้อ"
          date2Label="กำหนดส่งของ"
          date2Field="deliverDate"
          docNoLabel="เลขที่ PO"
          onSubmit={async (data) => {
            setLoading(true)
            const res = await fetch('/api/purchase-orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                supplierId: data.supplierId,
                poNo: data.docNo,
                orderDate: data.date1,
                deliverDate: data.deliverDate,
                items: data.items,
                discount: data.discount,
                taxRate: data.taxRate,
                note: data.note,
              }),
            })
            if (res.ok) router.push('/accounting/purchase-orders')
            else setLoading(false)
          }}
          loading={loading}
        />
      </div>
    </div>
  )
}
