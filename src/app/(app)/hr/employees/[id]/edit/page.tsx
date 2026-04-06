'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function EditEmployeePage() {
  const router = useRouter()
  const { id } = useParams()
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [form, setForm] = useState({
    employeeCode: '', firstName: '', lastName: '', email: '', phone: '',
    position: '', departmentId: '', salary: '', startDate: '',
    bankAccount: '', bankName: '', nationalId: '', address: '', status: 'active',
  })

  useEffect(() => {
    Promise.all([
      fetch(`/api/employees/${id}`).then(r => r.json()),
      fetch('/api/departments').then(r => r.json()),
    ]).then(([emp, depts]) => {
      setForm({
        employeeCode: emp.employeeCode || '',
        firstName: emp.firstName || '',
        lastName: emp.lastName || '',
        email: emp.email || '',
        phone: emp.phone || '',
        position: emp.position || '',
        departmentId: emp.departmentId || '',
        salary: String(emp.salary || ''),
        startDate: emp.startDate ? emp.startDate.split('T')[0] : '',
        bankAccount: emp.bankAccount || '',
        bankName: emp.bankName || '',
        nationalId: emp.nationalId || '',
        address: emp.address || '',
        status: emp.status || 'active',
      })
      setDepartments(depts)
      setFetching(false)
    })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/employees/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, salary: parseFloat(form.salary) }),
    })
    if (res.ok) router.push(`/hr/employees/${id}`)
    else setLoading(false)
  }

  const f = (key: string) => ({
    value: form[key as keyof typeof form],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))
  })

  if (fetching) return <div className="p-8 text-center text-slate-400">กำลังโหลด...</div>

  return (
    <div>
      <Header title="แก้ไขข้อมูลพนักงาน" />
      <div className="p-6">
        <Link href={`/hr/employees/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4">
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">สถานะ</label>
                  <select className="w-full border rounded-md px-3 py-2 text-sm" {...f('status')}>
                    <option value="active">ทำงานอยู่</option>
                    <option value="inactive">หยุดชั่วคราว</option>
                    <option value="terminated">พ้นสภาพ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ธนาคาร</label>
                  <Input {...f('bankName')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">เลขบัญชีธนาคาร</label>
                  <Input {...f('bankAccount')} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Link href={`/hr/employees/${id}`}>
              <Button type="button" variant="outline">ยกเลิก</Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
