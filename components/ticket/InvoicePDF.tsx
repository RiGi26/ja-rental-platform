import React from 'react'
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'

const SERVICE_FEE = 5_000

const c = {
  primary:  '#1A56DB',
  dark:     '#1E293B',
  gray:     '#64748B',
  lightBg:  '#F8FAFC',
  success:  '#16A34A',
  successBg:'#DCFCE7',
  border:   '#E2E8F0',
  white:    '#FFFFFF',
}

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: c.white,
    paddingHorizontal: 40,
    paddingVertical: 36,
  },

  // ── Header ────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: c.primary,
  },
  brandName: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: c.primary,
  },
  brandSub: {
    fontSize: 9,
    color: c.gray,
    marginTop: 2,
  },
  invoiceBlock: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: c.dark,
    marginBottom: 4,
  },
  invoiceNo: {
    fontSize: 10,
    fontFamily: 'Courier-Bold',
    color: c.primary,
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 9,
    color: c.gray,
  },
  badge: {
    marginTop: 6,
    backgroundColor: c.successBg,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  badgeText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: c.success,
  },

  // ── Bill To ────────────────────────────────────────────
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: c.gray,
    letterSpacing: 1.5,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 9,
    color: c.gray,
    width: 110,
  },
  fieldValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: c.dark,
    flex: 1,
  },

  // ── Items Table ────────────────────────────────────────
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: c.primary,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: c.border,
  },
  tableRowAlt: {
    backgroundColor: c.lightBg,
  },
  colDesc:  { flex: 3, fontSize: 9 },
  colQty:   { width: 32, fontSize: 9, textAlign: 'center' },
  colPrice: { width: 80, fontSize: 9, textAlign: 'right' },
  colTotal: { width: 80, fontSize: 9, textAlign: 'right' },
  thText:   { fontSize: 8, fontFamily: 'Helvetica-Bold', color: c.white },

  descMain:  { fontSize: 9,  fontFamily: 'Helvetica-Bold', color: c.dark },
  descSub:   { fontSize: 8,  color: c.gray, marginTop: 2 },

  // ── Totals ─────────────────────────────────────────────
  totalsSection: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
    width: 220,
  },
  totalRowBold: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1.5,
    borderTopColor: c.dark,
    width: 220,
  },
  totalLabel:  { fontSize: 9,  color: c.gray, flex: 1 },
  totalValue:  { fontSize: 9,  color: c.dark, textAlign: 'right', width: 80 },
  totalLabelB: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: c.dark, flex: 1 },
  totalValueB: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: c.primary, textAlign: 'right', width: 80 },

  // ── Payment Info ───────────────────────────────────────
  paySection: {
    marginTop: 20,
    padding: 14,
    backgroundColor: c.lightBg,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: c.primary,
  },
  payTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: c.dark,
    marginBottom: 6,
  },

  // ── Footer ─────────────────────────────────────────────
  pageFooter: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: c.border,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: { fontSize: 8, color: c.gray },
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
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(iso))
}

function formatDateCompact(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface InvoicePDFProps {
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

export function InvoicePDF({ booking, schedule, passengers, payment }: InvoicePDFProps) {
  const { route } = schedule
  const isPaid     = payment?.status === 'paid'
  const paxCount   = passengers.length
  const firstPax   = passengers[0]
  const seats      = passengers.map(p => p.seat_number).join(', ')
  const ticketTotal    = schedule.price_adult * paxCount
  const serviceFeeTotal = SERVICE_FEE * paxCount
  const invoiceDate    = formatDateCompact(booking.created_at)
  const invoiceNo      = `INV-${booking.booking_code}-${invoiceDate}`

  return (
    <Document title={`Invoice ${invoiceNo}`} author="JaMobility">
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.brandName}>JaMobility</Text>
            <Text style={s.brandSub}>Webzoka</Text>
            <Text style={s.brandSub}>webzoka.com</Text>
          </View>
          <View style={s.invoiceBlock}>
            <Text style={s.invoiceTitle}>INVOICE</Text>
            <Text style={s.invoiceNo}>{invoiceNo}</Text>
            <Text style={s.invoiceDate}>Tanggal: {formatDateTime(booking.created_at)}</Text>
            {isPaid && (
              <View style={s.badge}>
                <Text style={s.badgeText}>LUNAS</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bill To */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>TAGIHAN KEPADA</Text>
          <View style={s.fieldRow}>
            <Text style={s.fieldLabel}>Nama</Text>
            <Text style={s.fieldValue}>{firstPax?.name ?? '-'}</Text>
          </View>
          <View style={s.fieldRow}>
            <Text style={s.fieldLabel}>No. HP</Text>
            <Text style={s.fieldValue}>{firstPax?.phone ?? '-'}</Text>
          </View>
          <View style={s.fieldRow}>
            <Text style={s.fieldLabel}>Kode Booking</Text>
            <Text style={s.fieldValue}>{booking.booking_code}</Text>
          </View>
          <View style={s.fieldRow}>
            <Text style={s.fieldLabel}>Rute</Text>
            <Text style={s.fieldValue}>{route.origin} - {route.destination}</Text>
          </View>
          <View style={s.fieldRow}>
            <Text style={s.fieldLabel}>Keberangkatan</Text>
            <Text style={s.fieldValue}>{formatDateTime(schedule.depart_at)} WIB</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>RINCIAN PEMBELIAN</Text>
          <View style={s.tableHeader}>
            <Text style={{ ...s.colDesc,  ...s.thText }}>Deskripsi</Text>
            <Text style={{ ...s.colQty,   ...s.thText }}>Qty</Text>
            <Text style={{ ...s.colPrice, ...s.thText }}>Harga</Text>
            <Text style={{ ...s.colTotal, ...s.thText }}>Total</Text>
          </View>

          {/* Tiket */}
          <View style={s.tableRow}>
            <View style={s.colDesc}>
              <Text style={s.descMain}>Tiket Travel</Text>
              <Text style={s.descSub}>{route.origin} - {route.destination}</Text>
              <Text style={s.descSub}>Kursi: {seats}</Text>
            </View>
            <Text style={{ ...s.colQty,   color: c.dark }}>{paxCount}</Text>
            <Text style={{ ...s.colPrice, color: c.dark }}>{formatRp(schedule.price_adult)}</Text>
            <Text style={{ ...s.colTotal, color: c.dark }}>{formatRp(ticketTotal)}</Text>
          </View>

          {/* Biaya layanan */}
          <View style={{ ...s.tableRow, ...s.tableRowAlt }}>
            <View style={s.colDesc}>
              <Text style={s.descMain}>Biaya Layanan</Text>
              <Text style={s.descSub}>Termasuk asuransi perjalanan</Text>
            </View>
            <Text style={{ ...s.colQty,   color: c.dark }}>{paxCount}</Text>
            <Text style={{ ...s.colPrice, color: c.dark }}>{formatRp(SERVICE_FEE)}</Text>
            <Text style={{ ...s.colTotal, color: c.dark }}>{formatRp(serviceFeeTotal)}</Text>
          </View>
        </View>

        {/* Totals */}
        <View style={s.totalsSection}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Subtotal Tiket</Text>
            <Text style={s.totalValue}>{formatRp(ticketTotal)}</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Biaya Layanan</Text>
            <Text style={s.totalValue}>{formatRp(serviceFeeTotal)}</Text>
          </View>
          <View style={s.totalRowBold}>
            <Text style={s.totalLabelB}>TOTAL</Text>
            <Text style={s.totalValueB}>{formatRp(booking.total_amount)}</Text>
          </View>
        </View>

        {/* Payment Info */}
        {isPaid && (
          <View style={s.paySection}>
            <Text style={s.payTitle}>INFORMASI PEMBAYARAN</Text>
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>Status</Text>
              <Text style={{ ...s.fieldValue, color: c.success }}>LUNAS</Text>
            </View>
            {payment?.method && (
              <View style={s.fieldRow}>
                <Text style={s.fieldLabel}>Metode</Text>
                <Text style={s.fieldValue}>{payment.method.toUpperCase()}</Text>
              </View>
            )}
            {payment?.paid_at && (
              <View style={s.fieldRow}>
                <Text style={s.fieldLabel}>Dibayar pada</Text>
                <Text style={s.fieldValue}>{formatDateTime(payment.paid_at)} WIB</Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={s.pageFooter} fixed>
          <Text style={s.footerText}>Invoice ini sah secara digital tanpa tanda tangan basah.</Text>
          <Text style={s.footerText}>webzoka.com  |  noreply@webzoka.com</Text>
        </View>

      </Page>
    </Document>
  )
}
