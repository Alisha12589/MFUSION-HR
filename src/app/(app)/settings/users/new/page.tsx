'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, ShieldCheck, Users, User } from 'lucide-react'

const roles = [
  { value: 'admin', label: 'ผู้ดูแลระบบ', desc: 'เข้าถึงได้ทุกฟีเจอร์ รวมถึงจัดการผู้ใช้', icon: ShieldCheck, color: 'border-red-200 bg-red-50 text-red-700' },
  { value: 'hr', label: 'HR', desc: 'จัดการพนักงาน เงินเดือน การลงเวลา', icon: Users, color: 'border-blue-200 bg-blue-50 text-blue-700' },
  { value: 'accountant', label: 'บัญชี', desc: 'จัดการบัญชี ใบแจ้งหนี้ รายรับ-รายจ่าย', icon: User, color: 'border-green-200 bg-green-50 text-green-700' },
  { value: 'user', label: 'ผู้ใช้ทั่วไป', desc: 'ดูข้อมูลได้ แต่แก้ไขได้จำกัด', icon: User, color: 'border-gray-200 bg-gray-50 text-gray-700' },
]

export default function NewUserPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })

  const f = (key: string) => ({
    value: form[key as keyof typeof form],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      router.push('/settings/users')
    } else {
      const data = await res.json()
      setError(data.error || 'เกิดข้อผิดพลาด')
      setLoading(false)
    }
  }

  return (
    <div>
      <Header title="สร้างบัญชีผู้ใช้ใหม่" />
      <div className="p-6 max-w-2xl">
        <Link href="/settings/users" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-5">
          <ArrowLeft size={14} /> กลับ
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">ข้อมูลบัญชี</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อ-นามสกุล</label>
                <Input {...f('name')} placeholder="ชื่อผู้ใช้งาน" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">อีเมล *</label>
                <Input type="email" {...f('email')} placeholder="email@company.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">รหัสผ่าน * <span className="text-slate-400 font-normal">(อย่างน้อย 6 ตัวอักษร)</span></label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    {...f('password')}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role selection */}
          <Card>
            <CardHeader><CardTitle className="text-base">สิทธิ์การใช้งาน</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {roles.map(role => (
                  <label
                    key={role.value}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      form.role === role.value
                        ? role.color + ' border-current'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={form.role === role.value}
                      onChange={() => setForm(prev => ({ ...prev, role: role.value }))}
                      className="mt-0.5 accent-blue-600"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-semibold text-sm">
                        <role.icon size={14} />
                        {role.label}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{role.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Link href="/settings/users">
              <Button type="button" variant="outline">ยกเลิก</Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? 'กำลังสร้าง...' : 'สร้างบัญชี'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
