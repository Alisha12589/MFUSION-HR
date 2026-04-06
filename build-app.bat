@echo off
chcp 65001 >nul
title MFUSION-HR - สร้างไฟล์ .exe

echo.
echo ╔══════════════════════════════════════════╗
echo ║   MFUSION-HR — สร้างไฟล์ติดตั้ง .exe   ║
echo ╚══════════════════════════════════════════╝
echo.
echo [1/4] กำลัง Build Next.js...
echo ─────────────────────────────────────────
call npm run build
if %errorlevel% neq 0 (
  echo.
  echo ❌ Build Next.js ล้มเหลว กรุณาตรวจสอบข้อผิดพลาดด้านบน
  pause
  exit /b 1
)

echo.
echo [2/4] กำลังคัดลอกไฟล์ static...
echo ─────────────────────────────────────────
xcopy /E /I /Y ".next\static" ".next\standalone\.next\static" >nul
xcopy /E /I /Y "public" ".next\standalone\public" >nul
echo ✅ คัดลอกไฟล์เสร็จแล้ว

echo.
echo [3/4] กำลังตรวจสอบฐานข้อมูล...
echo ─────────────────────────────────────────
if not exist "prisma\dev.db" (
  echo สร้างฐานข้อมูลเปล่า...
  call npm run db:push
)
echo ✅ ฐานข้อมูลพร้อมแล้ว

echo.
echo [4/4] กำลังสร้างไฟล์ .exe...
echo ─────────────────────────────────────────
call npx electron-builder --win --x64
if %errorlevel% neq 0 (
  echo.
  echo ❌ สร้างไฟล์ .exe ล้มเหลว
  pause
  exit /b 1
)

echo.
echo ╔══════════════════════════════════════════╗
echo ║   ✅ สร้างเสร็จแล้ว!                     ║
echo ║   ไฟล์ติดตั้งอยู่ในโฟลเดอร์: dist\       ║
echo ╚══════════════════════════════════════════╝
echo.
explorer dist
pause
