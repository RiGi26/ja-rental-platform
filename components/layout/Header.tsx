'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Globe, LogIn } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export default function Header() {
  const [currency, setCurrency] = useState('JPY')
  const [lang, setLang] = useState('ID')

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
            J
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-slate-900 hidden sm:block">
            JaTravel
          </span>
        </Link>

        {/* Right Nav */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language & Currency */}
          <div className="hidden sm:flex items-center gap-2">
            <Select value={lang} onValueChange={(val) => setLang(val ?? 'ID')}>
              <SelectTrigger className="w-[80px] h-9 border-none bg-transparent hover:bg-slate-100 focus:ring-0 shadow-none">
                <Globe size={16} className="text-slate-500 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ID">ID</SelectItem>
                <SelectItem value="EN">EN</SelectItem>
                <SelectItem value="JP">JP</SelectItem>
              </SelectContent>
            </Select>

            <div className="h-4 w-px bg-slate-200" />

            <Select value={currency} onValueChange={(val) => setCurrency(val ?? 'JPY')}>
              <SelectTrigger className="w-[80px] h-9 border-none bg-transparent hover:bg-slate-100 focus:ring-0 shadow-none font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JPY">JPY ¥</SelectItem>
                <SelectItem value="IDR">IDR Rp</SelectItem>
                <SelectItem value="USD">USD $</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Login / Register */}
          <Link href="/auth/login" className="hidden sm:flex px-4 py-2 text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors">
            Masuk
          </Link>
          <Link href="/auth/register" className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full shadow-glow bg-primary hover:bg-primary-hover text-white transition-all">
            <span className="hidden sm:inline">Daftar</span>
            <LogIn size={16} className="sm:hidden" />
          </Link>
        </div>
      </div>
    </header>
  )
}
