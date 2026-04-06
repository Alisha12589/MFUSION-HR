'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { DocumentForm } from '@/components/forms/document-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewQuotationPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(setCustomers)
  }, [])

  return (
    <div>
      <Header title="สร้างใบเสนอราคาใหม่" />
      <div className="p-6">
        <Link href="/accounting/quotations" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4">
          <ArrowLeft size={14} /> กลับ
        </Link>
        <DocumentForm
          title="รายละเอียดใบเสนอราคา"
          contacts={customers}
          contactLabel="ลูกค้า"
          contactField="customerId"
          dateLabel="วันที่ออก"
          date2Label="วันหมดอายุ"
          date2Field="validUntil"
          docNoLabel="เลขที่ใบเสนอราคา"
          onSubmit={async (data) => {
            setLoading(true)
            const res = await fetch('/api/quotations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customerId: data.customerId,
                quotationNo: data.docNo,
                issueDate: data.date1,
                validUntil: data.validUntil,
                items: data.items,
                discount: data.discount,
                taxRate: data.taxRate,
                note: data.note,
              }),
            })
            if (res.ok) router.push('/accounting/quotations')
            else setLoading(false)
          }}
          loading={loading}
        />
      </div>
    </div>
  )
}
