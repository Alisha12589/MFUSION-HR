@echo off
chcp 65001 >nul
echo ====================================
echo   MFUSION-HR - เริ่มใช้งาน
echo ====================================
echo.
echo กำลังเริ่ม server...
echo เปิดเบราว์เซอร์ไปที่ http://localhost:3000
echo.
echo กด Ctrl+C เพื่อหยุด server
echo.
npm run dev
