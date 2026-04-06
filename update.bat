@echo off
chcp 65001 >nul
echo ====================================
echo   MFUSION-HR - อัพเดทโปรแกรม
echo ====================================
echo.
echo กำลังดึงโค้ดใหม่จาก GitHub...
git pull
echo.
echo กำลังติดตั้ง packages ใหม่ (ถ้ามี)...
npm install
echo.
echo กำลังอัพเดท database (ถ้ามีการเปลี่ยนแปลง)...
npx prisma db push
echo.
echo ====================================
echo   อัพเดทเสร็จแล้ว!
echo   พิมพ์ npm run dev เพื่อเริ่มใช้งาน
echo ====================================
pause
