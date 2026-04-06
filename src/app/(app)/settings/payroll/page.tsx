'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2, GripVertical, Check, X } from 'lucide-react'

type Template = {
  id: string
  name: string
  type: string
  calcType: string
  value: number
  isActive: boolean
  sortOrder: number
  note: string | null
}

const defaultForm = {
  name: '',
  type: 'deduction',
  calcType: 'fixed',
  value: '',
  isActive: true,
  note: '',
}

export default function PayrollSettingsPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Template | null>(null)
  const [form, setForm] = useState({ ...defaultForm })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = () => {
    fetch('/api/payroll-templates').then(r => r.json()).then(data => {
      setTemplates(data)
      setLoading(false)
    })
  }
  useEffect(() => { load() }, [])

  const openNew = () => {
    setEditing(null)
    setForm({ ...defaultForm })
    setShowForm(true)
  }

  const openEdit = (t: Template) => {
    setEditing(t)
    setForm({
      name: t.name,
      type: t.type,
      calcType: t.calcType,
      value: String(t.value),
      isActive: t.isActive,
      note: t.note || '',
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const payload = {
      name: form.name,
      type: form.type,
      calcType: form.calcType,
      value: parseFloat(form.value) || 0,
      isActive: form.isActive,
      note: form.note || null,
    }
    if (editing) {
      await fetch(`/api/payroll-templates/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/payroll-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }
    setSaving(false)
    closeForm()
    load()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/payroll-templates/${id}`, { method: 'DELETE' })
    setDeleteId(null)
    load()
  }

  const handleToggle = async (t: Template) => {
    await fetch(`/api/payroll-templates/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...t, isActive: !t.isActive }),
    })
    load()
  }

  const f = (key: string) => ({
    value: (form as any)[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value })),
  })

  const additions = templates.filter(t => t.type === 'addition')
  const deductions = templates.filter(t => t.type === 'deduction')

  const valueLabel = (t: Template) => {
    if (t.calcType === 'fixed') return formatCurrency(t.value)
    if (t.calcType === 'percentage') return `${t.value}%`
    return 'กรอกเอง'
  }

  const calcTypeLabel: Record<string, string> = {
    fixed: 'จำนวนคงที่',
    percentage: '% จากเงินเดือน',
    manual: 'กรอกเอง',
  }

  return (
    <div>
      <Header title="ตั้งค่ารายการเงินเดือน" />
      <div className="p-6 max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            กำหนดรายการเพิ่ม/หักเงินเดือนที่ใช้เมื่อสร้างสลิปเงินเดือน
          </p>
          <Button onClick={openNew} className="inline-flex items-center gap-2">
            <Plus size={16} /> เพิ่มรายการ
          </Button>
        </div>

        {/* Additions */}
        <Card>
          <div className="px-5 py-3 border-b flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <h2 className="font-semibold text-slate-800">รายการเพิ่มเงิน</h2>
            <span className="text-xs text-slate-400 ml-1">{additions.length} รายการ</span>
          </div>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-center text-slate-400 text-sm">กำลังโหลด...</div>
            ) : additions.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">ยังไม่มีรายการเพิ่มเงิน</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs">
                    <th className="text-left px-4 py-2 font-medium">ชื่อรายการ</th>
                    <th className="text-left px-4 py-2 font-medium">วิธีคำนวณ</th>
                    <th className="text-right px-4 py-2 font-medium">ค่า</th>
                    <th className="text-left px-4 py-2 font-medium">หมายเหตุ</th>
                    <th className="text-center px-4 py-2 font-medium">ใช้งาน</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {additions.map(t => (
                    <tr key={t.id} className="border-t hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{t.name}</td>
                      <td className="px-4 py-3 text-slate-500">{calcTypeLabel[t.calcType]}</td>
                      <td className="px-4 py-3 text-right text-green-700 font-medium">{valueLabel(t)}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{t.note || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggle(t)}
                          className={`w-10 h-5 rounded-full transition-colors ${t.isActive ? 'bg-green-500' : 'bg-slate-200'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${t.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(t)} className="p-1.5 rounded hover:bg-blue-100 text-blue-600">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded hover:bg-red-100 text-red-500">
                            <Trash2 size={13} />
                          </button>
                        </div>
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
          <div className="px-5 py-3 border-b flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <h2 className="font-semibold text-slate-800">รายการหักเงิน</h2>
            <span className="text-xs text-slate-400 ml-1">{deductions.length} รายการ</span>
          </div>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-center text-slate-400 text-sm">กำลังโหลด...</div>
            ) : deductions.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">ยังไม่มีรายการหักเงิน</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs">
                    <th className="text-left px-4 py-2 font-medium">ชื่อรายการ</th>
                    <th className="text-left px-4 py-2 font-medium">วิธีคำนวณ</th>
                    <th className="text-right px-4 py-2 font-medium">ค่า</th>
                    <th className="text-left px-4 py-2 font-medium">หมายเหตุ</th>
                    <th className="text-center px-4 py-2 font-medium">ใช้งาน</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {deductions.map(t => (
                    <tr key={t.id} className="border-t hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{t.name}</td>
                      <td className="px-4 py-3 text-slate-500">{calcTypeLabel[t.calcType]}</td>
                      <td className="px-4 py-3 text-right text-red-600 font-medium">{valueLabel(t)}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{t.note || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggle(t)}
                          className={`w-10 h-5 rounded-full transition-colors ${t.isActive ? 'bg-green-500' : 'bg-slate-200'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${t.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(t)} className="p-1.5 rounded hover:bg-blue-100 text-blue-600">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded hover:bg-red-100 text-red-500">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-semibold text-slate-800">{editing ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}</h2>
              <button onClick={closeForm} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อรายการ *</label>
                <Input placeholder="เช่น ประกันสังคม, ค่าล่วงเวลา" {...f('name')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ประเภท *</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                    value={form.type}
                    onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  >
                    <option value="addition">เพิ่มเงิน</option>
                    <option value="deduction">หักเงิน</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">วิธีคำนวณ *</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                    value={form.calcType}
                    onChange={e => setForm(p => ({ ...p, calcType: e.target.value }))}
                  >
                    <option value="fixed">จำนวนคงที่ (บาท)</option>
                    <option value="percentage">เปอร์เซ็นต์ (%)</option>
                    <option value="manual">กรอกเองทุกครั้ง</option>
                  </select>
                </div>
              </div>
              {form.calcType !== 'manual' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {form.calcType === 'percentage' ? 'เปอร์เซ็นต์ (%)' : 'จำนวนเงิน (บาท)'}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step={form.calcType === 'percentage' ? '0.01' : '1'}
                    placeholder={form.calcType === 'percentage' ? 'เช่น 3 = 3%' : 'เช่น 875'}
                    {...f('value')}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">หมายเหตุ</label>
                <Input placeholder="คำอธิบายเพิ่มเติม (ไม่บังคับ)" {...f('note')} />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm text-slate-700">เปิดใช้งาน (จะปรากฏในสลิปเงินเดือนอัตโนมัติ)</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t bg-slate-50 rounded-b-xl">
              <Button variant="outline" onClick={closeForm}>ยกเลิก</Button>
              <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
                {saving ? 'กำลังบันทึก...' : editing ? 'บันทึกการแก้ไข' : 'เพิ่มรายการ'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="font-semibold text-slate-800 mb-2">ยืนยันการลบ</h2>
            <p className="text-sm text-slate-500 mb-6">ต้องการลบรายการนี้หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteId(null)}>ยกเลิก</Button>
              <Button onClick={() => handleDelete(deleteId)} className="bg-red-600 hover:bg-red-700 text-white">
                ลบรายการ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
