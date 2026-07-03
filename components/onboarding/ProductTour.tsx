'use client'

import { useEffect, useRef } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { preemptDriver, registerDriver, releaseDriver } from '@/lib/onboarding/driver-guard'
import { firstVisible } from '@/lib/onboarding/visible'

// ============================================================
// ProductTour — driver.js coachmark tour, mobile-safe.
// Loaded via next/dynamic(ssr:false) from OnboardingLauncher, so driver.js + CSS
// stay out of the initial bundle. Runs whenever `runToken` increments to a new
// positive value.
//
// Each logical step points at a data-tour KEY. At run time we resolve the key to
// the anchor that is actually REACHABLE (see visible.ts — horizontal-only filter
// because the mobile sidebar stays mounted off-screen): the sidebar on desktop,
// the dashboard checklist / quick-action anchors on mobile. Steps with no
// reachable anchor (e.g. entitlement-hidden nav items) are silently skipped.
// ============================================================

interface TourStep {
  /** data-tour key (without the attribute wrapper) */
  key: string
  title: string
  description: string
}

const ADMIN_TOUR: TourStep[] = [
  {
    key: 'onboarding-checklist',
    title: 'Misi Pertama',
    description: 'Ikuti daftar singkat ini untuk menyiapkan usahamu. Progresnya tersimpan otomatis.',
  },
  {
    key: 'nav-fleet',
    title: 'Armada',
    description: 'Mulai di sini — masukkan kendaraanmu lengkap dengan kapasitas dan statusnya.',
  },
  {
    key: 'nav-schedules',
    title: 'Jadwal',
    description: 'Susun jadwal keberangkatan dari armada dan rute yang sudah kamu buat.',
  },
  {
    key: 'nav-bookings',
    title: 'Booking',
    description: 'Booking dari pelanggan masuk ke sini. Kamu proses dan pantau statusnya dari halaman ini.',
  },
  {
    key: 'nav-billing',
    title: 'Langganan',
    description: 'Cek status paket dan tingkatkan langganan kapan saja dari sini.',
  },
]

interface ProductTourProps {
  runToken: number
  onDone: () => void
}

export function ProductTour({ runToken, onDone }: ProductTourProps) {
  const lastRun = useRef(0)

  useEffect(() => {
    if (runToken <= 0 || runToken === lastRun.current) return
    lastRun.current = runToken

    const steps = ADMIN_TOUR
      .map((s) => {
        const el = firstVisible(`[data-tour="${s.key}"]`)
        return el ? { element: el, popover: { title: s.title, description: s.description } } : null
      })
      .filter((s): s is NonNullable<typeof s> => s !== null)

    if (steps.length === 0) {
      onDone()
      return
    }

    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      onDone()
    }

    const handle = { destroy: () => d.destroy() }
    const d = driver({
      showProgress: true,
      allowClose: true,
      overlayColor: 'rgba(2, 6, 23, 0.55)',
      nextBtnText: 'Lanjut',
      prevBtnText: 'Kembali',
      doneBtnText: 'Selesai',
      progressText: '{{current}} / {{total}}',
      popoverClass: 'ja-tour',
      onDestroyed: () => {
        releaseDriver(handle)
        finish()
      },
    })

    // The tour is an explicit user action — tear down any coachmark that's showing
    // (driver.js is a module-global singleton; two live instances break each other),
    // then hold the slot so coachmarks defer while the tour runs.
    preemptDriver()
    registerDriver(handle)
    d.setSteps(steps)
    d.drive()

    return () => {
      if (d.isActive()) d.destroy()
    }
  }, [runToken, onDone])

  return null
}
