'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface UserActionsProps {
  userId: string
  userEmail: string
}

export function UserActions({ userId, userEmail }: UserActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`ยืนยันการลบบัญชี "${userEmail}" หรือไม่?`)) return
    setDeleting(true)
    const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error || 'เกิดข้อผิดพลาด')
    }
    setDeleting(false)
  }

  return (
    <div className="flex justify-center gap-1.5">
      <Link
        href={`/settings/users/${userId}/edit`}
        className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
        title="แก้ไข"
      >
        <Pencil size={14} />
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition-colors disabled:opacity-40"
        title="ลบ"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}
