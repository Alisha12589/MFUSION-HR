import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, ShieldCheck, User, Users } from 'lucide-react'
import { UserActions } from './user-actions'
import { formatDate } from '@/lib/utils'

export default async function UsersPage() {
  const session = await auth()
  if ((session?.user as any)?.role !== 'admin') redirect('/dashboard')

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  const roleLabel: Record<string, string> = {
    admin: 'ผู้ดูแลระบบ', hr: 'HR', accountant: 'บัญชี', user: 'ผู้ใช้ทั่วไป'
  }
  const roleColor: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    hr: 'bg-blue-100 text-blue-700',
    accountant: 'bg-green-100 text-green-700',
    user: 'bg-gray-100 text-gray-700',
  }
  const roleIcon: Record<string, React.ReactNode> = {
    admin: <ShieldCheck size={12} />,
    hr: <Users size={12} />,
    accountant: <User size={12} />,
    user: <User size={12} />,
  }

  return (
    <div>
      <Header title="จัดการบัญชีผู้ใช้" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500">บัญชีทั้งหมด {users.length} บัญชี</p>
          <Link
            href="/settings/users/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus size={16} /> สร้างบัญชีใหม่
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left px-4 py-3 font-medium text-slate-600">ชื่อ</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">อีเมล</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">สิทธิ์</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">วันที่สร้าง</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800">{user.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{user.email}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColor[user.role] || 'bg-gray-100 text-gray-700'}`}>
                          {roleIcon[user.role]}
                          {roleLabel[user.role] || user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3">
                        <UserActions userId={user.id} userEmail={user.email} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Role legend */}
        <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-500">
          <p className="font-medium text-slate-700 mb-2">สิทธิ์การใช้งาน:</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(roleLabel).map(([k, v]) => (
              <span key={k} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${roleColor[k]}`}>
                {roleIcon[k]} {v}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
