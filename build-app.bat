@echo off
chcp 65001 >nul
title MFUSION-HR - สร้างไฟล์ติดตั้ง

echo.
echo ╔══════════════════════════════════════════╗
echo ║   MFUSION-HR — สร้างไฟล์ติดตั้ง         ║
echo ╚══════════════════════════════════════════╝
echo.
echo เลือกระบบที่ต้องการสร้าง:
echo.
echo   [1] Windows (.exe)
echo   [2] macOS (.dmg)  — ต้องรันบน Mac เท่านั้น
echo   [3] ทั้ง Windows และ macOS
echo.
set /p choice="กรอกตัวเลข (1/2/3): "

if "%choice%"=="1" set BUILD_CMD=npm run electron:build
if "%choice%"=="2" set BUILD_CMD=npm run electron:build:mac
if "%choice%"=="3" set BUILD_CMD=npm run electron:build:all

if "%BUILD_CMD%"=="" (
  echo ❌ ตัวเลือกไม่ถูกต้อง
  pause
  exit /b 1
)

echo.
echo [1/4] กำลัง Build Next.js...
echo ─────────────────────────────────────────
call npm run build
if %errorlevel% neq 0 (
  echo ❌ Build Next.js ล้มเหลว
  pause & exit /b 1
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
  call npm run db:push
)
echo ✅ ฐานข้อมูลพร้อมแล้ว

echo.
echo [4/4] กำลังสร้างไฟล์ติดตั้ง...
echo ─────────────────────────────────────────
call %BUILD_CMD%
if %errorlevel% neq 0 (
  echo ❌ สร้างไฟล์ล้มเหลว
  pause & exit /b 1
)

echo.
echo ╔══════════════════════════════════════════╗
echo ║   ✅ สร้างเสร็จแล้ว!                     ║
echo ║   ไฟล์อยู่ในโฟลเดอร์: dist\             ║
echo ╚══════════════════════════════════════════╝
echo.
explorer dist
pause
