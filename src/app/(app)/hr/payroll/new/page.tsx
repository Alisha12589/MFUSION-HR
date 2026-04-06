'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

type Template = {
  id: string
  name: string
  type: string
  calcType: string
  value: number
  isActive: boolean
  sortOrder: number
}

type LineItem = {
  templateId: string | null
  name: string
  type: string
  calcType: string
  amount: string
  sortOrder: number
}

const months = [
  'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
  'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'
]

function calcAmount(template: Template, baseSalary: number): string {
  if (template.calcType === 'fixed') return String(template.value)
  if (template.calcType === 'percentage') return String(Math.round(baseSalary * template.value / 100 * 100) / 100)
  return '' // manual
}

export default function NewPayrollPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<any[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    employeeId: '',
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    note: '',
  })
  const [items, setItems] = useState<LineItem[]>([])
  const [baseSalary, setBaseSalary] = useState(0)

  useEffect(() => {
    fetch('/api/employees').then(r => r.json()).then(setEmployees)
    fetch('/api/payroll-templates').then(r => r.json()).then(setTemplates)
  }, [])

  // When employee changes, reset items from active templates
  useEffect(() => {
    if (!form.employeeId) { setBaseSalary(0); setItems([]); return }
    const emp = employees.find(e => e.id === form.employeeId)
    if (!emp) return
    const base = emp.salary
    setBaseSalary(base)
    const active = templates.filter(t => t.isActive)
    setItems(active.map((t, i) => ({
      templateId: t.id,
      name: t.name,
      type: t.type,
      calcType: t.calcType,
      amount: calcAmount(t, base),
      sortOrder: t.sortOrder ?? i,
    })))
  }, [form.employeeId, employees, templates])

  const setItemAmount = (idx: number, value: string) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, amount: value } : item))
  }

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  const addCustomItem = (type: 'addition' | 'deduction') => {
    setItems(prev => [...prev, {
      templateId: null,
      name: '',
      type,
      calcType: 'manual',
      amount: '',
      sortOrder: prev.length,
    }])
  }

  const setItemField = (idx: number, field: string, value: string) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const additions = items.filter(i => i.type === 'addition')
  const deductions = items.filter(i => i.type === 'deduction')

  const totalAdditions = additions.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)
  const totalDeductions = deductions.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)
  const netSalary = baseSalary + totalAdditions - totalDeductions

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.employeeId) return
    setLoading(true)
    const res = await fetch('/api/payroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: form.employeeId,
        month: form.month,
        year: form.year,
        note: form.note,
        items: items.map((item, i) => ({
          templateId: item.templateId,
          name: item.name,
          type: item.type,
          amount: parseFloat(item.amount) || 0,
          sortOrder: i,
        })),
      }),
    })
    if (res.ok) router.push('/hr/payroll')
    else setLoading(false)
  }

  const f = (key: string) => ({
    value: (form as any)[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value })),
  })

  return (
    <div>
      <Header title="สร้างรายการเงินเดือน" />
      <div className="p-6 max-w-5xl">
        <Link href="/hr/payroll" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4">
          <ArrowLeft size={14} /> กลับ
        </Link>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left: Employee & Period */}
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">ข้อมูลพื้นฐาน</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">พนักงาน *</label>
                    <select className="w-full border rounded-md px-3 py-2 text-sm bg-white" {...f('employeeId')} required>
                      <option value="">-- เลือกพนักงาน --</option>
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>{e.employeeCode} - {e.firstName} {e.lastName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">เดือน *</label>
                      <select className="w-full border rounded-md px-3 py-2 text-sm bg-white" {...f('month')} required>
                        {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">ปี (ค.ศ.)</label>
                      <Input type="number" {...f('year')} required />
                    </div>
                  </div>
                  {baseSalary > 0 && (
                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <span className="text-slate-500">เงินเดือนพื้นฐาน:</span>
                      <span className="font-semibold ml-2">{formatCurrency(baseSalary)}</span>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">หมายเหตุ</label>
                    <Input placeholder="หมายเหตุ (ไม่บังคับ)" {...f('note')} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Items + Preview */}
            <div className="lg:col-span-2 space-y-4">
              {/* Additions */}
              <Card>
                <div className="px-5 py-3 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <h3 className="font-semibold text-slate-800 text-sm">รายการเพิ่มเงิน</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => addCustomItem('addition')}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus size={12} /> เพิ่มรายการ
                  </button>
                </div>
                <CardContent className="p-0">
                  {items.filter(i => i.type === 'addition').length === 0 ? (
                    <p className="text-center text-slate-400 text-sm py-4">ไม่มีรายการเพิ่มเงิน</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-slate-400 bg-slate-50">
                          <th className="text-left px-4 py-2">รายการ</th>
                          <th className="text-right px-4 py-2 w-36">จำนวน (บาท)</th>
                          <th className="w-8 px-2 py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, idx) => item.type !== 'addition' ? null : (
                          <tr key={idx} className="border-t">
                            <td className="px-4 py-2">
                              {item.templateId ? (
                                <span className="text-slate-700">{item.name}</span>
                              ) : (
                                <Input
                                  placeholder="ชื่อรายการ"
                                  value={item.name}
                                  onChange={e => setItemField(idx, 'name', e.target.value)}
                                  className="h-8 text-sm"
                                />
                              )}
                              {item.calcType === 'percentage' && (
                                <span className="text-xs text-slate-400 ml-1">({
                                  templates.find(t => t.id === item.templateId)?.value
                                }% ของเงินเดือน)</span>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.amount}
                                onChange={e => setItemAmount(idx, e.target.value)}
                                className="h-8 text-sm text-right"
                                placeholder="0"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <button type="button" onClick={() => removeItem(idx)} className="text-slate-300 hover:text-red-500">
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>

              {/* Deductions */}
              <Card>
                <div className="px-5 py-3 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <h3 className="font-semibold text-slate-800 text-sm">รายการหักเงิน</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => addCustomItem('deduction')}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus size={12} /> เพิ่มรายการ
                  </button>
                </div>
                <CardContent className="p-0">
                  {items.filter(i => i.type === 'deduction').length === 0 ? (
                    <p className="text-center text-slate-400 text-sm py-4">ไม่มีรายการหักเงิน</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-slate-400 bg-slate-50">
                          <th className="text-left px-4 py-2">รายการ</th>
                          <th className="text-right px-4 py-2 w-36">จำนวน (บาท)</th>
                          <th className="w-8 px-2 py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, idx) => item.type !== 'deduction' ? null : (
                          <tr key={idx} className="border-t">
                            <td className="px-4 py-2">
                              {item.templateId ? (
                                <span className="text-slate-700">{item.name}</span>
                              ) : (
                                <Input
                                  placeholder="ชื่อรายการ"
                                  value={item.name}
                                  onChange={e => setItemField(idx, 'name', e.target.value)}
                                  className="h-8 text-sm"
                                />
                              )}
                              {item.calcType === 'percentage' && (
                                <span className="text-xs text-slate-400 ml-1">({
                                  templates.find(t => t.id === item.templateId)?.value
                                }% ของเงินเดือน)</span>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.amount}
                                onChange={e => setItemAmount(idx, e.target.value)}
                                className="h-8 text-sm text-right"
                                placeholder="0"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <button type="button" onClick={() => removeItem(idx)} className="text-slate-300 hover:text-red-500">
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>

              {/* Net summary */}
              {baseSalary > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-slate-600">
                        <span>เงินเดือนพื้นฐาน</span>
                        <span>{formatCurrency(baseSalary)}</span>
                      </div>
                      {totalAdditions > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>รวมรายการเพิ่ม</span>
                          <span>+{formatCurrency(totalAdditions)}</span>
                        </div>
                      )}
                      {totalDeductions > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>รวมรายการหัก</span>
                          <span>-{formatCurrency(totalDeductions)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-base border-t pt-2">
                        <span>รับสุทธิ</span>
                        <span className="text-blue-600 text-lg">{formatCurrency(netSalary)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Link href="/hr/payroll"><Button type="button" variant="outline">ยกเลิก</Button></Link>
            <Button type="submit" disabled={loading || !form.employeeId}>
              {loading ? 'กำลังบันทึก...' : 'บันทึกรายการเงินเดือน'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
