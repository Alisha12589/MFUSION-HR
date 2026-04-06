'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { formatCurrency, getThaiMonth } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Printer, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type PayrollItem = {
  id: string
  name: string
  type: string
  amount: number
  sortOrder: number
}

type Payroll = {
  id: string
  month: number
  year: number
  baseSalary: number
  netSalary: number
  status: string
  note: string | null
  items: PayrollItem[]
  employee: {
    employeeCode: string
    firstName: string
    lastName: string
    position: string
    bankName: string | null
    bankAccount: string | null
    department: { name: string } | null
  }
}

export default function PaySlipPage() {
  const { id } = useParams()
  const [payroll, setPayroll] = useState<Payroll | null>(null)

  useEffect(() => {
    fetch(`/api/payroll/${id}`).then(r => r.json()).then(setPayroll)
  }, [id])

  if (!payroll) return <div className="p-8 text-center text-slate-400">กำลังโหลด...</div>

  const { employee, month, year, baseSalary, netSalary, items } = payroll

  const additions = items.filter(i => i.type === 'addition')
  const deductions = items.filter(i => i.type === 'deduction')
  const totalAdditions = additions.reduce((s, i) => s + i.amount, 0)
  const totalDeductions = deductions.reduce((s, i) => s + i.amount, 0)

  return (
    <div>
      <Header title="สลิปเงินเดือน" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Link href="/hr/payroll" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
            <ArrowLeft size={14} /> กลับ
          </Link>
          <Button onClick={() => window.print()} variant="outline">
            <Printer size={16} className="mr-1.5" /> พิมพ์สลิป
          </Button>
        </div>

        {/* Pay Slip */}
        <div className="max-w-2xl mx-auto bg-white border rounded-xl p-8 print:border-0 print:p-0 shadow-sm">
          {/* Header */}
          <div className="text-center border-b pb-4 mb-6">
            <h1 className="text-xl font-bold text-slate-800">บริษัท ตัวอย่าง จำกัด</h1>
            <p className="text-slate-500 text-sm">สลิปเงินเดือน</p>
            <p className="text-slate-600 font-medium mt-1">ประจำเดือน {getThaiMonth(month)} {year + 543}</p>
          </div>

          {/* Employee Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p><span className="text-slate-500">รหัสพนักงาน:</span> <strong>{employee.employeeCode}</strong></p>
              <p><span className="text-slate-500">ชื่อ-นามสกุล:</span> <strong>{employee.firstName} {employee.lastName}</strong></p>
            </div>
            <div>
              <p><span className="text-slate-500">ตำแหน่ง:</span> <strong>{employee.position}</strong></p>
              <p><span className="text-slate-500">แผนก:</span> <strong>{employee.department?.name || '-'}</strong></p>
            </div>
          </div>

          {/* Salary breakdown */}
          <div className="grid grid-cols-2 gap-6 text-sm">
            {/* Earnings */}
            <div>
              <h3 className="font-semibold text-slate-700 border-b pb-1 mb-2">รายรับ</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">เงินเดือน</span>
                  <span>{formatCurrency(baseSalary)}</span>
                </div>
                {additions.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-slate-600">{item.name}</span>
                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>รวมรายรับ</span>
                  <span>{formatCurrency(baseSalary + totalAdditions)}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h3 className="font-semibold text-slate-700 border-b pb-1 mb-2">รายหัก</h3>
              <div className="space-y-1">
                {deductions.length === 0 ? (
                  <p className="text-slate-400 text-xs">ไม่มีรายการหัก</p>
                ) : (
                  deductions.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-slate-600">{item.name}</span>
                      <span className="text-red-600">{formatCurrency(item.amount)}</span>
                    </div>
                  ))
                )}
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>รวมรายหัก</span>
                  <span className="text-red-600">{formatCurrency(totalDeductions)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4 flex justify-between items-center">
            <span className="font-bold text-slate-800 text-lg">รับสุทธิ</span>
            <span className="font-bold text-blue-700 text-2xl">{formatCurrency(netSalary)}</span>
          </div>

          {/* Bank info */}
          {employee.bankName && (
            <div className="mt-4 text-sm text-slate-500 text-right">
              โอนเข้า: {employee.bankName} {employee.bankAccount}
            </div>
          )}

          {payroll.note && (
            <div className="mt-4 text-sm text-slate-500 border-t pt-3">
              <span className="font-medium text-slate-700">หมายเหตุ:</span> {payroll.note}
            </div>
          )}

          <div className="mt-8 grid grid-cols-2 gap-8 text-sm text-center">
            <div>
              <div className="border-t pt-2 mt-8">ผู้รับ</div>
            </div>
            <div>
              <div className="border-t pt-2 mt-8">ผู้อนุมัติ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
