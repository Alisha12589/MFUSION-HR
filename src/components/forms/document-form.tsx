'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'

interface Item {
  description: string
  quantity: string
  unitPrice: string
  amount: number
}

interface DocumentFormProps {
  title: string
  contacts: { id: string; name: string }[]
  contactLabel: string
  contactField: string
  dateLabel?: string
  date2Label?: string
  date2Field?: string
  docNoLabel?: string
  onSubmit: (data: any) => Promise<void>
  loading: boolean
}

export function DocumentForm({
  title, contacts, contactLabel, contactField,
  dateLabel = 'วันที่', date2Label, date2Field,
  docNoLabel, onSubmit, loading
}: DocumentFormProps) {
  const [contactId, setContactId] = useState('')
  const [docNo, setDocNo] = useState('')
  const [date1, setDate1] = useState(new Date().toISOString().split('T')[0])
  const [date2, setDate2] = useState('')
  const [discount, setDiscount] = useState('0')
  const [taxRate, setTaxRate] = useState('7')
  const [note, setNote] = useState('')
  const [items, setItems] = useState<Item[]>([
    { description: '', quantity: '1', unitPrice: '0', amount: 0 }
  ])

  const updateItem = (idx: number, key: keyof Item, val: string) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item
      const updated = { ...item, [key]: val }
      if (key === 'quantity' || key === 'unitPrice') {
        updated.amount = parseFloat(updated.quantity || '0') * parseFloat(updated.unitPrice || '0')
      }
      return updated
    }))
  }

  const addItem = () => setItems(prev => [...prev, { description: '', quantity: '1', unitPrice: '0', amount: 0 }])
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx))

  const subtotal = items.reduce((s, i) => s + i.amount, 0)
  const discountAmt = parseFloat(discount) || 0
  const taxAmt = (subtotal - discountAmt) * ((parseFloat(taxRate) || 0) / 100)
  const total = subtotal - discountAmt + taxAmt

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data: any = {
      [contactField]: contactId,
      docNo,
      date1,
      items: items.map(i => ({ ...i, quantity: parseFloat(i.quantity), unitPrice: parseFloat(i.unitPrice) })),
      discount,
      taxRate,
      note,
    }
    if (date2Field) data[date2Field] = date2
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{contactLabel} *</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={contactId}
                onChange={e => setContactId(e.target.value)}
                required
              >
                <option value="">-- เลือก --</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {docNoLabel && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{docNoLabel}</label>
                <Input value={docNo} onChange={e => setDocNo(e.target.value)} placeholder="(ออกอัตโนมัติ)" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{dateLabel} *</label>
              <Input type="date" value={date1} onChange={e => setDate1(e.target.value)} required />
            </div>
            {date2Label && date2Field && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{date2Label} *</label>
                <Input type="date" value={date2} onChange={e => setDate2(e.target.value)} required />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">รายการสินค้า/บริการ</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus size={14} /> เพิ่มรายการ
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium text-slate-600">รายการ</th>
                <th className="text-right py-2 font-medium text-slate-600 w-24">จำนวน</th>
                <th className="text-right py-2 font-medium text-slate-600 w-32">ราคา/หน่วย</th>
                <th className="text-right py-2 font-medium text-slate-600 w-32">รวม</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2 pr-2">
                    <Input
                      value={item.description}
                      onChange={e => updateItem(idx, 'description', e.target.value)}
                      placeholder="รายการ..."
                      required
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={e => updateItem(idx, 'quantity', e.target.value)}
                      className="text-right"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={e => updateItem(idx, 'unitPrice', e.target.value)}
                      className="text-right"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="py-2 pr-2 text-right font-medium">{formatCurrency(item.amount)}</td>
                  <td className="py-2">
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)} className="p-1 text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-4 flex justify-end">
            <div className="w-72 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">ราคารวม</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">ส่วนลด</span>
                <Input
                  type="number"
                  value={discount}
                  onChange={e => setDiscount(e.target.value)}
                  className="w-32 text-right h-8"
                  min="0"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">ภาษีมูลค่าเพิ่ม (%)</span>
                <Input
                  type="number"
                  value={taxRate}
                  onChange={e => setTaxRate(e.target.value)}
                  className="w-32 text-right h-8"
                  min="0"
                  max="100"
                />
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ภาษี</span>
                <span>{formatCurrency(taxAmt)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>ยอดรวมสุทธิ</span>
                <span className="text-blue-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note */}
      <Card>
        <CardContent className="pt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">หมายเหตุ</label>
          <textarea
            className="w-full border rounded-md px-3 py-2 text-sm"
            rows={2}
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => history.back()}>ยกเลิก</Button>
        <Button type="submit" disabled={loading}>{loading ? 'กำลังบันทึก...' : 'บันทึก'}</Button>
      </div>
    </form>
  )
}
