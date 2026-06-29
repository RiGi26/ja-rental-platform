'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Globe, LogIn, User, ChevronDown, LogOut, ClipboardList, Settings } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createCoreClient } from '@/lib/supabase/client'

interface UserData {
  id:        string
  email:     string
  full_name: string | null
}

interface Props {
  initialUser: UserData | null
}

export default function HeaderClient({ initialUser }: Props) {
  const router = useRouter()
  const [currency,      setCurrency]      = useState('JPY')
  const [lang,          setLang]          = useState('ID')
  const [dropdownOpen,  setDropdownOpen]  = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSignOut() {
    setDropdownOpen(false)
    const supabase = createCoreClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const displayName = initialUser?.full_name?.split(' ')[0] ?? initialUser?.email?.split('@')[0] ?? ''
  const initials    = displayName.slice(0, 2).toUpperCase()

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1A56DB] rounded-lg flex items-center justify-center text-white font-bold text-xl">
            J
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-slate-900 hidden sm:block">
            JaMobility
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

          {/* Auth section */}
          {initialUser ? (
            /* Logged in: avatar + dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 bg-[#1A56DB] text-white rounded-full flex items-center justify-center
                                text-xs font-bold flex-shrink-0">
                  {initials}
                </div>
                <span className="hidden sm:block text-sm font-semibold text-slate-700 max-w-[100px] truncate">
                  {displayName}
                </span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-panel
                                border border-slate-100 py-1 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-800 truncate">{displayName}</p>
                    <p className="text-xs text-slate-400 truncate">{initialUser.email}</p>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700
                               hover:bg-slate-50 transition-colors"
                  >
                    <User size={15} className="text-slate-400" />
                    Akun Saya
                  </Link>
                  <Link
                    href="/account/bookings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700
                               hover:bg-slate-50 transition-colors"
                  >
                    <ClipboardList size={15} className="text-slate-400" />
                    Histori Booking
                  </Link>
                  <Link
                    href="/account/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700
                               hover:bg-slate-50 transition-colors"
                  >
                    <Settings size={15} className="text-slate-400" />
                    Edit Profil
                  </Link>
                  <div className="border-t border-slate-100 mt-1">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600
                                 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Guest: Login + Daftar */
            <>
              <Link
                href="/auth/login"
                className="hidden sm:flex px-4 py-2 text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full
                           shadow-glow bg-[#1A56DB] hover:bg-[#1447C0] text-white transition-all active:scale-[0.97]"
              >
                <span className="hidden sm:inline">Daftar</span>
                <LogIn size={16} className="sm:hidden" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
