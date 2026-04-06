'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const categories = ['เงินเดือนและค่าแรง', 'ค่าเช่า', 'ค่าสาธารณูปโภค', 'ค่าวัสดุสำนักงาน', 'ค่าโฆษณา', 'ค่าซ่อมแซม', 'ค่าเดินทาง', 'อื่นๆ']

export default function NewExpensePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [form, setForm] = useState({
    category: '', description: '', amount: '', date: new Date().toISOString().split('T')[0],
    supplierId: '', note: ''
  })

  useEffect(() => {
    fetch('/api/suppliers').then(r => r.json()).then(setSuppliers)
  }, [])

  const f = (key: string) => ({
    value: form[key as keyof typeof form],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) router.push('/accounting/expenses')
    else setLoading(false)
  }

  return (
    <div>
      <Header title="บันทึกรายจ่าย" />
      <div className="p-6 max-w-xl">
        <Link href="/accounting/expenses" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4">
          <ArrowLeft size={14} /> กลับ
        </Link>
        <Card>
          <CardHeader><CardTitle className="text-base">รายละเอียดรายจ่าย</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">หมวดหมู่ *</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm" {...f('category')} required>
                  <option value="">-- เลือกหมวดหมู่ --</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียด *</label>
                <Input {...f('description')} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">จำนวนเงิน (บาท) *</label>
                  <Input type="number" {...f('amount')} required min="0" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">วันที่ *</label>
                  <Input type="date" {...f('date')} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ผู้จัดจำหน่าย</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm" {...f('supplierId')}>
                  <option value="">-- เลือก (ถ้ามี) --</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">หมายเหตุ</label>
                <textarea className="w-full border rounded-md px-3 py-2 text-sm" rows={2} {...f('note')} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Link href="/accounting/expenses"><Button type="button" variant="outline">ยกเลิก</Button></Link>
                <Button type="submit" disabled={loading}>{loading ? 'กำลังบันทึก...' : 'บันทึก'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
