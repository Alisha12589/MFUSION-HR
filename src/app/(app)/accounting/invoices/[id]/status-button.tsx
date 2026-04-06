'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const transitions: Record<string, { label: string; next: string; color: string }[]> = {
  draft: [{ label: 'ส่งใบแจ้งหนี้', next: 'sent', color: 'bg-blue-600 text-white hover:bg-blue-700' }],
  sent: [
    { label: 'บันทึกรับชำระ', next: 'paid', color: 'bg-green-600 text-white hover:bg-green-700' },
    { label: 'ยกเลิก', next: 'cancelled', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
  ],
  paid: [],
  cancelled: [],
  overdue: [{ label: 'บันทึกรับชำระ', next: 'paid', color: 'bg-green-600 text-white hover:bg-green-700' }],
}

export function InvoiceStatusButton({ invoiceId, currentStatus }: { invoiceId: string; currentStatus: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const actions = transitions[currentStatus] || []

  if (actions.length === 0) return null

  const handleAction = async (next: string) => {
    setLoading(true)
    await fetch(`/api/invoices/${invoiceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <>
      {actions.map(action => (
        <button
          key={action.next}
          onClick={() => handleAction(action.next)}
          disabled={loading}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${action.color}`}
        >
          {loading ? '...' : action.label}
        </button>
      ))}
    </>
  )
}
