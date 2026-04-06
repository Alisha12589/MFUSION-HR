'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewEmployeePage() {
  const router = useRouter()
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    employeeCode: '', firstName: '', lastName: '', email: '', phone: '',
    position: '', departmentId: '', salary: '', startDate: '',
    bankAccount: '', bankName: '', nationalId: '', address: '',
  })

  useEffect(() => {
    fetch('/api/departments').then(r => r.json()).then(setDepartments)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, salary: parseFloat(form.salary) }),
    })
    if (res.ok) router.push('/hr/employees')
    else setLoading(false)
  }

  const f = (key: string) => ({
    value: form[key as keyof typeof form],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))
  })

  return (
    <div>
      <Header title="เพิ่มพนักงานใหม่" />
      <div className="p-6">
        <Link href="/hr/employees" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4">
          <ArrowLeft size={14} /> กลับ
        </Link>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">ข้อมูลทั่วไป</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'รหัสพนักงาน *', key: 'employeeCode', required: true },
                  { label: 'ชื่อ *', key: 'firstName', required: true },
                  { label: 'นามสกุล *', key: 'lastName', required: true },
                  { label: 'อีเมล', key: 'email', type: 'email' },
                  { label: 'เบอร์โทร', key: 'phone' },
                  { label: 'เลขบัตรประชาชน', key: 'nationalId' },
                ].map(item => (
                  <div key={item.key}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{item.label}</label>
                    <Input type={item.type || 'text'} {...f(item.key)} required={item.required} />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ที่อยู่</label>
                  <textarea className="w-full border rounded-md px-3 py-2 text-sm" rows={2} {...f('address')} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">ข้อมูลการทำงาน</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ตำแหน่ง *</label>
                  <Input {...f('position')} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">แผนก</label>
                  <select className="w-full border rounded-md px-3 py-2 text-sm" {...f('departmentId')}>
                    <option value="">-- เลือกแผนก --</option>
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">เงินเดือน (บาท) *</label>
                  <Input type="number" {...f('salary')} required min="0" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">วันที่เริ่มงาน *</label>
                  <Input type="date" {...f('startDate')} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ธนาคาร</label>
                  <Input placeholder="ชื่อธนาคาร" {...f('bankName')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">เลขบัญชีธนาคาร</label>
                  <Input {...f('bankAccount')} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Link href="/hr/employees">
              <Button type="button" variant="outline">ยกเลิก</Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
