'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, ArrowLeft, CheckCircle2, Loader2, KeyRound } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Check if user exists
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (res.ok) {
      setSubmitted(true)
    } else {
      const data = await res.json()
      setError(data.error || 'ไม่พบบัญชีผู้ใช้นี้ในระบบ')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full" />
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Building2 size={22} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl">Company ERP</span>
        </div>
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
            <KeyRound size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight">
            ลืมรหัสผ่าน?
          </h2>
          <p className="mt-3 text-blue-200 text-lg">
            ไม่ต้องกังวล เราจะช่วยคุณ
            <br />
            รีเซ็ตรหัสผ่านได้ทันที
          </p>
        </div>
        <div className="relative z-10 text-blue-300 text-sm">
          © {new Date().getFullYear()} Company ERP System.
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-3">
              <Building2 size={28} className="text-white" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            {submitted ? (
              /* Success state */
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-green-600" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">ส่งคำขอแล้ว</h2>
                <p className="text-slate-500 text-sm mb-2">
                  คำขอรีเซ็ตรหัสผ่านสำหรับ
                </p>
                <p className="font-semibold text-slate-700 text-sm mb-4">{email}</p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 text-left mb-6">
                  <p className="font-semibold mb-1">ขั้นตอนถัดไป:</p>
                  <p>ผู้ดูแลระบบจะทำการรีเซ็ตรหัสผ่านให้คุณ กรุณาติดต่อผู้ดูแลระบบโดยตรงเพื่อรับรหัสผ่านใหม่</p>
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <ArrowLeft size={14} />
                  กลับสู่หน้าเข้าสู่ระบบ
                </Link>
              </div>
            ) : (
              /* Form */
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-800">รีเซ็ตรหัสผ่าน</h2>
                  <p className="text-slate-500 mt-1 text-sm">
                    กรอกอีเมลที่ใช้ลงทะเบียนเพื่อรีเซ็ตรหัสผ่าน
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      อีเมล
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="example@company.com"
                      required
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        กำลังดำเนินการ...
                      </>
                    ) : 'ส่งคำขอรีเซ็ตรหัสผ่าน'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
                  >
                    <ArrowLeft size={14} />
                    กลับสู่หน้าเข้าสู่ระบบ
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
