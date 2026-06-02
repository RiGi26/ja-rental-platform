import React from 'react'
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'

const SERVICE_FEE = 5_000

const c = {
  primary:  '#1A56DB',
  dark:     '#1E293B',
  gray:     '#64748B',
  lightBg:  '#F8FAFC',
  blueBg:   '#EFF6FF',
  success:  '#16A34A',
  successBg:'#DCFCE7',
  border:   '#E2E8F0',
  white:    '#FFFFFF',
  warnBg:   '#FEF9C3',
  warnText: '#854D0E',
}

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: c.white,
  },

  // ── Header ────────────────────────────────────────────
  header: {
    backgroundColor: c.primary,
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerBrand: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: c.white,
  },
  headerLabel: {
    fontSize: 8,
    color: c.white,
    opacity: 0.7,
    letterSpacing: 2,
    marginTop: 3,
  },

  // ── Route ──────────────────────────────────────────────
  routeSection: {
    backgroundColor: c.blueBg,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'column',
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityBlock: {
    flex: 1,
    alignItems: 'center',
  },
  cityName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: c.dark,
  },
  cityTime: {
    fontSize: 10,
    color: c.gray,
    marginTop: 2,
  },
  arrow: {
    fontSize: 16,
    color: c.primary,
    marginHorizontal: 12,
  },
  routeDate: {
    fontSize: 9,
    color: c.gray,
    marginTop: 8,
    textAlign: 'center',
  },

  // ── Booking Code ───────────────────────────────────────
  codeSection: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  codeLabel: {
    fontSize: 8,
    color: c.gray,
    letterSpacing: 2,
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 22,
    fontFamily: 'Courier-Bold',
    color: c.primary,
    letterSpacing: 3,
  },

  // ── Details ────────────────────────────────────────────
  detailSection: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  detailLeft: {
    flex: 1,
  },
  detailItem: {
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 8,
    color: c.gray,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: c.dark,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  qrImage: {
    width: 88,
    height: 88,
  },
  qrLabel: {
    fontSize: 7,
    color: c.gray,
    marginTop: 4,
    textAlign: 'center',
  },

  // ── Passengers Table ────────────────────────────────────
  tableSection: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  tableTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: c.gray,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: c.lightBg,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 3,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: c.border,
  },
  colNo:     { width: 20, fontSize: 9, color: c.dark },
  colName:   { flex: 2,   fontSize: 9, color: c.dark },
  colSeat:   { width: 44, fontSize: 9, color: c.dark, textAlign: 'center' },
  colPickup: { flex: 2,   fontSize: 9, color: c.dark },
  thText:    { fontSize: 8, color: c.gray, fontFamily: 'Helvetica-Bold' },

  // ── Footer ─────────────────────────────────────────────
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: c.lightBg,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  totalLabel: { fontSize: 9, color: c.gray, marginBottom: 2 },
  totalAmount: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: c.dark },
  badge: {
    backgroundColor: c.successBg,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
  },
  badgeText: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: c.success },

  // ── Notice ─────────────────────────────────────────────
  notice: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: c.warnBg,
  },
  noticeText: { fontSize: 8, color: c.warnText, textAlign: 'center' },

  // ── Watermark ──────────────────────────────────────────
  watermarkWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watermark: {
    fontSize: 72,
    fontFamily: 'Helvetica-Bold',
    color: c.success,
    opacity: 0.06,
    transform: 'rotate(-45deg)',
  },
})

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatRp(n: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n)
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(iso))
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(iso))
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0 && m > 0) return `${h}j ${m}m`
  if (h > 0) return `${h} jam`
  return `${m} menit`
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface ETicketPDFProps {
  booking: {
    booking_code: string
    seats: string[]
    total_amount: number
    created_at: string
  }
  schedule: {
    depart_at: string
    price_adult: number
    pickup_points: { id: string; label: string; address: string }[]
    route: { origin: string; destination: string; duration_minutes: number }
    vehicle: { brand: string; model: string; plate: string }
  }
  passengers: {
    name: string
    phone: string
    seat_number: string
    pickup_point_id: string | null
  }[]
  payment: {
    status: string
    paid_at: string | null
    method: string | null
  } | null
  qrDataUrl: string
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ETicketPDF({ booking, schedule, passengers, payment, qrDataUrl }: ETicketPDFProps) {
  const { route, vehicle, pickup_points } = schedule
  const isPaid     = payment?.status === 'paid'
  const paxCount   = passengers.length
  const arrivalMs  = new Date(schedule.depart_at).getTime() + route.duration_minutes * 60_000
  const arrivalIso = new Date(arrivalMs).toISOString()

  function getPickupLabel(id: string | null): string {
    if (!id) return '-'
    return pickup_points.find(p => p.id === id)?.label ?? '-'
  }

  return (
    <Document title={`E-Ticket ${booking.booking_code}`} author="JaMobility">
      <Page size="A4" style={s.page}>

        {/* Watermark */}
        {isPaid && (
          <View style={s.watermarkWrap} fixed>
            <Text style={s.watermark}>LUNAS</Text>
          </View>
        )}

        {/* Header */}
        <View style={s.header}>
          <View style={s.detailLeft}>
            <Text style={s.headerBrand}>JaMobility</Text>
            <Text style={s.headerLabel}>E-TICKET PERJALANAN</Text>
          </View>
          {qrDataUrl ? (
            <Image src={qrDataUrl} style={{ width: 72, height: 72, backgroundColor: c.white, borderRadius: 6, padding: 4 }} />
          ) : null}
        </View>

        {/* Route */}
        <View style={s.routeSection}>
          <View style={s.routeRow}>
            <View style={s.cityBlock}>
              <Text style={s.cityName}>{route.origin}</Text>
              <Text style={s.cityTime}>{formatTime(schedule.depart_at)}</Text>
            </View>
            <Text style={s.arrow}>{'->'}</Text>
            <View style={s.cityBlock}>
              <Text style={s.cityName}>{route.destination}</Text>
              <Text style={s.cityTime}>{formatTime(arrivalIso)}</Text>
            </View>
          </View>
          <Text style={s.routeDate}>{formatDateTime(schedule.depart_at)} WIB</Text>
        </View>

        {/* Booking Code */}
        <View style={s.codeSection}>
          <Text style={s.codeLabel}>KODE BOOKING</Text>
          <Text style={s.codeValue}>{booking.booking_code}</Text>
        </View>

        {/* Detail + QR */}
        <View style={s.detailSection}>
          <View style={s.detailLeft}>
            <View style={s.detailItem}>
              <Text style={s.detailLabel}>ARMADA</Text>
              <Text style={s.detailValue}>{vehicle.brand} {vehicle.model}</Text>
            </View>
            <View style={s.detailItem}>
              <Text style={s.detailLabel}>PLAT NOMOR</Text>
              <Text style={s.detailValue}>{vehicle.plate}</Text>
            </View>
            <View style={s.detailItem}>
              <Text style={s.detailLabel}>ESTIMASI DURASI</Text>
              <Text style={s.detailValue}>{formatDuration(route.duration_minutes)}</Text>
            </View>
            <View style={s.detailItem}>
              <Text style={s.detailLabel}>JUMLAH PENUMPANG</Text>
              <Text style={s.detailValue}>{paxCount} orang</Text>
            </View>
          </View>
          <View style={s.qrContainer}>
            {qrDataUrl ? (
              <Image src={qrDataUrl} style={s.qrImage} />
            ) : null}
            <Text style={s.qrLabel}>Scan saat boarding</Text>
          </View>
        </View>

        {/* Passengers Table */}
        <View style={s.tableSection}>
          <Text style={s.tableTitle}>DATA PENUMPANG</Text>
          <View style={s.tableHeader}>
            <Text style={{ ...s.colNo,     ...s.thText }}>No</Text>
            <Text style={{ ...s.colName,   ...s.thText }}>Nama</Text>
            <Text style={{ ...s.colSeat,   ...s.thText }}>Kursi</Text>
            <Text style={{ ...s.colPickup, ...s.thText }}>Titik Jemput</Text>
          </View>
          {passengers.map((p, i) => (
            <View key={i} style={s.tableRow}>
              <Text style={s.colNo}>{i + 1}</Text>
              <Text style={s.colName}>{p.name}</Text>
              <Text style={s.colSeat}>{p.seat_number}</Text>
              <Text style={s.colPickup}>{getPickupLabel(p.pickup_point_id)}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <View>
            <Text style={s.totalLabel}>Total Pembayaran</Text>
            <Text style={s.totalAmount}>{formatRp(booking.total_amount)}</Text>
            {payment?.paid_at && (
              <Text style={{ fontSize: 8, color: c.gray, marginTop: 2 }}>
                Dibayar: {formatDateTime(payment.paid_at)}
                {payment.method ? ` via ${payment.method.toUpperCase()}` : ''}
              </Text>
            )}
          </View>
          <View style={s.badge}>
            <Text style={s.badgeText}>{isPaid ? 'LUNAS' : 'PENDING'}</Text>
          </View>
        </View>

        {/* Notice */}
        <View style={s.notice}>
          <Text style={s.noticeText}>
            Harap hadir minimal 15 menit sebelum keberangkatan. Tiket ini sah secara digital.
            Dikeluarkan oleh JaMobility — japanarenacorp.com
          </Text>
        </View>

      </Page>
    </Document>
  )
}
