'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function EditSupplierPage() {
  const router = useRouter()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [form, setForm] = useState({ name: '', taxId: '', email: '', phone: '', address: '', contactName: '' })

  useEffect(() => {
    fetch(`/api/suppliers/${id}`).then(r => r.json()).then(data => {
      setForm({
        name: data.name || '', taxId: data.taxId || '', email: data.email || '',
        phone: data.phone || '', address: data.address || '', contactName: data.contactName || '',
      })
      setFetching(false)
    })
  }, [id])

  const f = (key: string) => ({
    value: form[key as keyof typeof form],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/suppliers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) router.push('/contacts/suppliers')
    else setLoading(false)
  }

  if (fetching) return <div className="p-8 text-center text-slate-400">กำลังโหลด...</div>

  return (
    <div>
      <Header title="แก้ไขข้อมูลผู้จัดจำหน่าย" />
      <div className="p-6 max-w-xl">
        <Link href="/contacts/suppliers" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4">
          <ArrowLeft size={14} /> กลับ
        </Link>
        <Card>
          <CardHeader><CardTitle className="text-base">ข้อมูลผู้จัดจำหน่าย</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                { label: 'ชื่อบริษัท/บุคคล *', key: 'name', required: true },
                { label: 'เลขประจำตัวผู้เสียภาษี', key: 'taxId' },
                { label: 'อีเมล', key: 'email', type: 'email' },
                { label: 'เบอร์โทรศัพท์', key: 'phone' },
                { label: 'ชื่อผู้ติดต่อ', key: 'contactName' },
              ].map(item => (
                <div key={item.key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{item.label}</label>
                  <Input type={item.type || 'text'} {...f(item.key)} required={item.required} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ที่อยู่</label>
                <textarea className="w-full border rounded-md px-3 py-2 text-sm" rows={3} {...f('address')} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Link href="/contacts/suppliers"><Button type="button" variant="outline">ยกเลิก</Button></Link>
                <Button type="submit" disabled={loading}>{loading ? 'กำลังบันทึก...' : 'บันทึก'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
