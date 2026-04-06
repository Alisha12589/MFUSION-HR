'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, Clock, DollarSign, FileText,
  ShoppingCart, Receipt, TrendingUp, TrendingDown,
  Building2, ChevronDown, ChevronRight, Settings, LogOut,
  ShieldCheck, UserCog, SlidersHorizontal
} from 'lucide-react'
import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'

const navItems = [
  {
    title: 'แดชบอร์ด',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'ทรัพยากรบุคคล (HR)',
    icon: Users,
    children: [
      { title: 'พนักงาน', href: '/hr/employees', icon: Users },
      { title: 'การลงเวลา', href: '/hr/attendance', icon: Clock },
      { title: 'เงินเดือน', href: '/hr/payroll', icon: DollarSign },
      { title: 'แผนก', href: '/hr/departments', icon: Building2 },
    ],
  },
  {
    title: 'บัญชีและการเงิน',
    icon: Receipt,
    children: [
      { title: 'ใบเสนอราคา', href: '/accounting/quotations', icon: FileText },
      { title: 'ใบแจ้งหนี้/ใบวางบิล', href: '/accounting/invoices', icon: Receipt },
      { title: 'ใบสั่งซื้อ', href: '/accounting/purchase-orders', icon: ShoppingCart },
      { title: 'รายรับ', href: '/accounting/income', icon: TrendingUp },
      { title: 'รายจ่าย', href: '/accounting/expenses', icon: TrendingDown },
    ],
  },
  {
    title: 'ผู้ติดต่อ',
    icon: Building2,
    children: [
      { title: 'ลูกค้า', href: '/contacts/customers', icon: Users },
      { title: 'ผู้จัดจำหน่าย', href: '/contacts/suppliers', icon: Building2 },
    ],
  },
  {
    title: 'รายงาน',
    href: '/reports',
    icon: TrendingUp,
  },
  {
    title: 'ตั้งค่าระบบ',
    icon: Settings,
    children: [
      { title: 'ทั่วไป', href: '/settings', icon: Settings },
      { title: 'จัดการผู้ใช้', href: '/settings/users', icon: UserCog, adminOnly: true },
      { title: 'ตั้งค่าเงินเดือน', href: '/settings/payroll', icon: SlidersHorizontal, adminOnly: true },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === 'admin'
  const [openGroups, setOpenGroups] = useState<string[]>([
    'ทรัพยากรบุคคล (HR)', 'บัญชีและการเงิน'
  ])

  const toggleGroup = (title: string) => {
    setOpenGroups(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    )
  }

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-sm">HR</div>
          <div>
            <p className="font-bold text-sm">ระบบ HR & บัญชี</p>
            <p className="text-xs text-slate-400">Company ERP</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          if (item.children) {
            const isOpen = openGroups.includes(item.title)
            const isActive = item.children.some(c => pathname.startsWith(c.href))
            return (
              <div key={item.title}>
                <button
                  onClick={() => toggleGroup(item.title)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <item.icon size={16} />
                    {item.title}
                  </div>
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {isOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-slate-700 pl-3">
                    {item.children.filter(child => !(child as any).adminOnly || isAdmin).map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                          pathname === child.href || pathname.startsWith(child.href + '/')
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        )}
                      >
                        <child.icon size={14} />
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                pathname === item.href
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon size={16} />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-700 space-y-1">
        {/* User info */}
        <div className="px-3 py-2 rounded-lg bg-slate-800">
          <p className="text-xs text-white font-medium truncate">{session?.user?.name || session?.user?.email}</p>
          <p className="text-xs text-slate-400 truncate flex items-center gap-1">
            {isAdmin && <ShieldCheck size={10} className="text-red-400" />}
            {isAdmin ? 'ผู้ดูแลระบบ' : (session?.user as any)?.role || 'user'}
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut size={16} />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  )
}
