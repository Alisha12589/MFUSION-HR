import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from 'next-auth/react'

export const metadata: Metadata = {
  title: 'ระบบ HR & บัญชี | Company ERP',
  description: 'ระบบจัดการทรัพยากรบุคคลและบัญชีครบวงจร',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
