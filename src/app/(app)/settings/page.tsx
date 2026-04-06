import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  return (
    <div>
      <Header title="ตั้งค่าระบบ" />
      <div className="p-6 max-w-2xl space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base">ข้อมูลบริษัท</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'ชื่อบริษัท', placeholder: 'บริษัท ตัวอย่าง จำกัด' },
                { label: 'เลขประจำตัวผู้เสียภาษี', placeholder: '0-0000-00000-00-0' },
                { label: 'ที่อยู่', placeholder: 'เลขที่...' },
                { label: 'เบอร์โทร', placeholder: '02-xxx-xxxx' },
                { label: 'อีเมล', placeholder: 'info@company.com' },
                { label: 'เว็บไซต์', placeholder: 'www.company.com' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                  <input className="w-full border rounded-md px-3 py-2 text-sm" placeholder={f.placeholder} />
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">บันทึก</button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">ตั้งค่าภาษีและการเงิน</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'อัตรา VAT (%)', placeholder: '7' },
                { label: 'อัตราประกันสังคม (%)', placeholder: '5' },
                { label: 'สกุลเงิน', placeholder: 'THB' },
                { label: 'เงื่อนไขการชำระเงิน (วัน)', placeholder: '30' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                  <input className="w-full border rounded-md px-3 py-2 text-sm" placeholder={f.placeholder} />
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">บันทึก</button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
