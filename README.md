# MFUSION-HR — ระบบ HR & บัญชี

## วิธีติดตั้ง (ทำครั้งแรกครั้งเดียว)

---

### ขั้นตอนที่ 1 — ติดตั้งโปรแกรมที่จำเป็น

1. ติดตั้ง **Node.js** → https://nodejs.org → กดดาวน์โหลด **LTS** → ติดตั้งปกติ
2. ติดตั้ง **Git** → https://git-scm.com → กดดาวน์โหลด → ติดตั้งปกติ

---

### ขั้นตอนที่ 2 — ดาวน์โหลดโปรแกรม

เปิด **Command Prompt** (กด `Win+R` พิมพ์ `cmd` กด Enter) แล้วพิมพ์:

```
git clone https://github.com/Alisha12589/MFUSION-HR.git
cd MFUSION-HR
npm install
```

---

### ขั้นตอนที่ 3 — สร้างไฟล์ตั้งค่า

สร้างไฟล์ชื่อ `.env` ในโฟลเดอร์ `MFUSION-HR` แล้วใส่ข้อความนี้:

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="mfusion-hr-secret-key-2024"
NEXTAUTH_URL="http://localhost:3000"
```

---

### ขั้นตอนที่ 4 — ตั้งค่าฐานข้อมูล

ใน Command Prompt พิมพ์:

```
npx prisma db push
```

---

### ขั้นตอนที่ 5 — สร้างบัญชี Admin

ใน Command Prompt พิมพ์:

```
node -e "const{PrismaClient}=require('@prisma/client');const bcrypt=require('bcryptjs');const p=new PrismaClient();p.user.create({data:{name:'Admin',email:'admin@company.com',password:bcrypt.hashSync('admin1234',10),role:'admin'}}).then(()=>{console.log('สร้างบัญชีสำเร็จ');p.$disconnect()})"
```

---

### ขั้นตอนที่ 6 — เปิดใช้งาน

ดับเบิลคลิกไฟล์ **`start.bat`** ในโฟลเดอร์โปรแกรม

จากนั้นเปิดเบราว์เซอร์ไปที่: **http://localhost:3000**

```
อีเมล:    admin@company.com
รหัสผ่าน: admin1234
```

> แนะนำให้เปลี่ยนรหัสผ่านหลังเข้าใช้งานครั้งแรก

---

## การใช้งานประจำวัน

| ต้องการทำอะไร | วิธี |
|-------------|------|
| เปิดโปรแกรม | ดับเบิลคลิก `start.bat` |
| อัพเดทโปรแกรม | ดับเบิลคลิก `update.bat` |
| หยุดโปรแกรม | กด `Ctrl+C` ใน Command Prompt |

---

## ปัญหาที่พบบ่อย

**เปิดไม่ได้ ขึ้นว่า port 3000 is already in use**
```
npm run dev -- -p 3001
```
แล้วเปิดที่ http://localhost:3001 แทน

**ลืมรหัสผ่าน Admin**
```
node -e "const{PrismaClient}=require('@prisma/client');const bcrypt=require('bcryptjs');const p=new PrismaClient();p.user.update({where:{email:'admin@company.com'},data:{password:bcrypt.hashSync('admin1234',10)}}).then(()=>{console.log('รีเซ็ตสำเร็จ');p.$disconnect()})"
```
