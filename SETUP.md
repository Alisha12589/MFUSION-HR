# วิธีติดตั้งและรันระบบ HR & บัญชี

## 1. ติดตั้ง Node.js
ดาวน์โหลด Node.js LTS จาก https://nodejs.org แล้วติดตั้ง

## 2. ติดตั้ง dependencies
เปิด Terminal / Command Prompt ในโฟลเดอร์ `hr-accounting-app` แล้วรัน:
```bash
npm install
```

## 3. ตั้งค่าฐานข้อมูล
```bash
npx prisma db push
```

## 4. เพิ่มข้อมูลเริ่มต้น (optional)
```bash
npm run db:seed
```
บัญชีผู้ดูแลระบบ:
- Email: admin@company.com
- Password: admin123

## 5. รันระบบ
```bash
npm run dev
```
เปิดเบราว์เซอร์ที่ http://localhost:3000

## 6. ดูฐานข้อมูลผ่าน Prisma Studio (optional)
```bash
npm run db:studio
```
เปิดเบราว์เซอร์ที่ http://localhost:5555

---

## ฟีเจอร์ที่มี
- **HR**: จัดการพนักงาน, การลงเวลา, เงินเดือน, สลิปเงินเดือน, แผนก
- **บัญชี**: ใบเสนอราคา, ใบแจ้งหนี้/วางบิล, ใบสั่งซื้อ, รายรับ, รายจ่าย
- **ผู้ติดต่อ**: ลูกค้า, ผู้จัดจำหน่าย
- **รายงาน**: ภาพรวมการเงิน, สถิติพนักงาน
