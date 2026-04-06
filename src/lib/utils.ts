import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))
}

export function generateDocNo(prefix: string, count: number): string {
  const year = new Date().getFullYear() + 543
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const seq = String(count + 1).padStart(4, '0')
  return `${prefix}${year}${month}${seq}`
}

export function getThaiMonth(month: number): string {
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
    'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
    'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ]
  return months[month - 1]
}

export function calculateTax(salary: number): number {
  // Thai income tax calculation (simplified)
  const annual = salary * 12
  let tax = 0
  if (annual <= 150000) return 0
  if (annual <= 300000) tax = (annual - 150000) * 0.05
  else if (annual <= 500000) tax = 150000 * 0.05 + (annual - 300000) * 0.10
  else if (annual <= 750000) tax = 150000 * 0.05 + 200000 * 0.10 + (annual - 500000) * 0.15
  else if (annual <= 1000000) tax = 150000 * 0.05 + 200000 * 0.10 + 250000 * 0.15 + (annual - 750000) * 0.20
  else tax = 150000 * 0.05 + 200000 * 0.10 + 250000 * 0.15 + 250000 * 0.20 + (annual - 1000000) * 0.25
  return tax / 12
}

export function calculateSocialSecurity(salary: number): number {
  // 5% of salary, max 750 baht/month
  return Math.min(salary * 0.05, 750)
}
