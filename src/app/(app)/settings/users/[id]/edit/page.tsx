'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, ShieldCheck, Users, User } from 'lucide-react'

const roles = [
  { value: 'admin', label: 'ผู้ดูแลระบบ', desc: 'เข้าถึงได้ทุกฟีเจอร์', icon: ShieldCheck, color: 'border-red-200 bg-red-50 text-red-700' },
  { value: 'hr', label: 'HR', desc: 'จัดการพนักงานและเงินเดือน', icon: Users, color: 'border-blue-200 bg-blue-50 text-blue-700' },
  { value: 'accountant', label: 'บัญชี', desc: 'จัดการบัญชีและการเงิน', icon: User, color: 'border-green-200 bg-green-50 text-green-700' },
  { value: 'user', label: 'ผู้ใช้ทั่วไป', desc: 'ดูข้อมูลได้จำกัด', icon: User, color: 'border-gray-200 bg-gray-50 text-gray-700' },
]

export default function EditUserPage() {
  const router = useRouter()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })

  useEffect(() => {
    fetch(`/api/users/${id}`).then(r => r.json()).then(data => {
      setForm({ name: data.name || '', email: data.email || '', password: '', role: data.role || 'user' })
      setFetching(false)
    })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const body: any = { name: form.name, email: form.email, role: form.role }
    if (form.password) body.password = form.password

    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      router.push('/settings/users')
    } else {
      const data = await res.json()
      setError(data.error || 'เกิดข้อผิดพลาด')
      setLoading(false)
    }
  }

  if (fetching) return <div className="p-8 text-center text-slate-400">กำลังโหลด...</div>

  return (
    <div>
      <Header title="แก้ไขบัญชีผู้ใช้" />
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
                <Input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="ชื่อผู้ใช้งาน"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">อีเมล *</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  รหัสผ่านใหม่ <span className="text-slate-400 font-normal">(เว้นว่างหากไม่ต้องการเปลี่ยน)</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                    minLength={form.password ? 6 : 0}
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
                      className="mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-semibold text-sm">
                        <role.icon size={14} />
                        {role.label}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{role.desc}</p>
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
              {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
