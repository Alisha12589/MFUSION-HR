import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Pencil, Mail, Phone, Building2, CreditCard, MapPin, IdCard } from 'lucide-react'

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      department: true,
      payrolls: { orderBy: [{ year: 'desc' }, { month: 'desc' }], take: 6 },
      attendances: { orderBy: { date: 'desc' }, take: 10 },
    },
  })

  if (!employee) notFound()

  const statusLabel: Record<string, string> = { active: 'ทำงานอยู่', inactive: 'หยุดชั่วคราว', terminated: 'พ้นสภาพ' }
  const statusColor: Record<string, string> = {
    active: 'bg-green-100 text-green-700', inactive: 'bg-yellow-100 text-yellow-700', terminated: 'bg-red-100 text-red-700'
  }

  return (
    <div>
      <Header title="ข้อมูลพนักงาน" />
      <div className="p-6 space-y-5 max-w-4xl">
        <div className="flex items-center justify-between">
          <Link href="/hr/employees" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
            <ArrowLeft size={14} /> กลับ
          </Link>
          <Link
            href={`/hr/employees/${id}/edit`}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            <Pencil size={14} /> แก้ไขข้อมูล
          </Link>
        </div>

        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl shrink-0">
                {employee.firstName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{employee.firstName} {employee.lastName}</h2>
                    <p className="text-slate-500">{employee.position}</p>
                    {employee.department && (
                      <p className="text-sm text-blue-600 mt-0.5">{employee.department.name}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[employee.status]}`}>
                    {statusLabel[employee.status]}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{employee.employeeCode}</span>
                  <span>เริ่มงาน {formatDate(employee.startDate)}</span>
                  <span className="font-semibold text-slate-700">{formatCurrency(employee.salary)} / เดือน</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Contact Info */}
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">ข้อมูลติดต่อ</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { icon: Mail, label: 'อีเมล', value: employee.email },
                { icon: Phone, label: 'เบอร์โทร', value: employee.phone },
                { icon: IdCard, label: 'เลขบัตรประชาชน', value: employee.nationalId },
                { icon: MapPin, label: 'ที่อยู่', value: employee.address },
              ].map(row => (
                row.value ? (
                  <div key={row.label} className="flex gap-3">
                    <row.icon size={15} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">{row.label}</p>
                      <p className="text-slate-700">{row.value}</p>
                    </div>
                  </div>
                ) : null
              ))}
            </CardContent>
          </Card>

          {/* Bank Info */}
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">ข้อมูลธนาคาร</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { icon: Building2, label: 'ธนาคาร', value: employee.bankName },
                { icon: CreditCard, label: 'เลขบัญชี', value: employee.bankAccount },
              ].map(row => (
                row.value ? (
                  <div key={row.label} className="flex gap-3">
                    <row.icon size={15} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">{row.label}</p>
                      <p className="text-slate-700">{row.value}</p>
                    </div>
                  </div>
                ) : null
              ))}
              {!employee.bankName && !employee.bankAccount && (
                <p className="text-slate-400 text-xs">ยังไม่มีข้อมูลธนาคาร</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Payroll */}
        {employee.payrolls.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">ประวัติเงินเดือนล่าสุด</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-slate-500">เดือน/ปี</th>
                    <th className="text-right py-2 font-medium text-slate-500">เงินเดือน</th>
                    <th className="text-right py-2 font-medium text-slate-500">รับสุทธิ</th>
                    <th className="text-center py-2 font-medium text-slate-500">สถานะ</th>
                    <th className="py-2 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {employee.payrolls.map(p => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2">{p.month}/{p.year}</td>
                      <td className="py-2 text-right">{formatCurrency(p.baseSalary)}</td>
                      <td className="py-2 text-right font-semibold">{formatCurrency(p.netSalary)}</td>
                      <td className="py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {p.status === 'paid' ? 'จ่ายแล้ว' : p.status === 'approved' ? 'อนุมัติ' : 'ร่าง'}
                        </span>
                      </td>
                      <td className="py-2 text-right">
                        <Link href={`/hr/payroll/${p.id}/slip`} className="text-xs text-blue-600 hover:underline">สลิป</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
