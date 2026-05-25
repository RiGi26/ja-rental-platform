import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string | Date): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export function formatDateShort(dateString: string | Date): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function formatTime(dateString: string | Date): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date)
}

export function formatDuration(minutes: number): string {
  if (!minutes) return '0j 0m'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0 && m > 0) return `${h}j ${m}m`
  if (h > 0) return `${h} jam`
  return `${m} menit`
}

export function isWithinHours(dateString: string | Date, hours: number): boolean {
  if (!dateString) return false
  const date = new Date(dateString).getTime()
  const now = new Date().getTime()
  const diffInHours = (date - now) / (1000 * 60 * 60)
  return diffInHours > 0 && diffInHours <= hours
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0'))  return '62' + digits.slice(1)
  if (digits.startsWith('62')) return digits
  return '62' + digits
}

export function daysBetween(start: string, end: string): number {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
