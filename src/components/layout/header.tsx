'use client'

import { Bell, Search, User } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const { data: session } = useSession()

  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between sticky top-0 z-10">
      <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-slate-100 rounded-lg">
          <Search size={18} className="text-slate-500" />
        </button>
        <button className="p-2 hover:bg-slate-100 rounded-lg relative">
          <Bell size={18} className="text-slate-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={16} className="text-blue-600" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-slate-800">{session?.user?.name || 'ผู้ใช้'}</p>
            <p className="text-xs text-slate-500">{(session?.user as any)?.role || 'user'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
