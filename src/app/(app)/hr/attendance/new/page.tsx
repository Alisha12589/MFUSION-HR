'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewAttendancePage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    employeeId: '', date: new Date().toISOString().split('T')[0],
    checkIn: '', checkOut: '', status: 'present', note: ''
  })

  useEffect(() => {
    fetch('/api/employees').then(r => r.json()).then(setEmployees)
  }, [])

  const f = (key: string) => ({
    value: form[key as keyof typeof form],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) router.push('/hr/attendance')
    else setLoading(false)
  }

  return (
    <div>
      <Header title="บันทึกการเข้างาน" />
      <div className="p-6 max-w-lg">
        <Link href="/hr/attendance" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4">
          <ArrowLeft size={14} /> กลับ
        </Link>
        <Card>
          <CardHeader><CardTitle className="text-base">ข้อมูลการเข้างาน</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">พนักงาน *</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm" {...f('employeeId')} required>
                  <option value="">-- เลือกพนักงาน --</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">วันที่ *</label>
                <Input type="date" {...f('date')} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">สถานะ *</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm" {...f('status')} required>
                  <option value="present">มาทำงาน</option>
                  <option value="absent">ขาดงาน</option>
                  <option value="late">มาสาย</option>
                  <option value="leave">ลา</option>
                  <option value="holiday">วันหยุด</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">เวลาเข้างาน</label>
                  <Input type="time" {...f('checkIn')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">เวลาออกงาน</label>
                  <Input type="time" {...f('checkOut')} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">หมายเหตุ</label>
                <Input {...f('note')} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Link href="/hr/attendance"><Button type="button" variant="outline">ยกเลิก</Button></Link>
                <Button type="submit" disabled={loading}>{loading ? 'กำลังบันทึก...' : 'บันทึก'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
