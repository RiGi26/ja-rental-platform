import React from 'react'

interface Props {
  passengerName: string
  bookingCode:   string
  origin:        string
  destination:   string
  expiresAt:     string
  paymentUrl:    string
}

export function PaymentReminderEmail(props: Props): React.ReactElement {
  const { passengerName, bookingCode, origin, destination, expiresAt, paymentUrl } = props

  return (
    <html lang="id">
      <head><meta charSet="utf-8" /></head>
      <body style={{ margin: 0, padding: '24px 16px', backgroundColor: '#F8FAFC', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ backgroundColor: '#1A56DB', borderRadius: '12px 12px 0 0', padding: '24px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' }}>🚌 JaMobility</div>
          </div>

          {/* Body */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '32px', border: '1px solid #E2E8F0', borderTop: 'none' }}>

            <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8, padding: '16px 20px', marginBottom: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>⏰</div>
              <div style={{ fontSize: 17, fontWeight: 'bold', color: '#9A3412' }}>Segera Selesaikan Pembayaran</div>
              <div style={{ fontSize: 13, color: '#C2410C', marginTop: 4 }}>
                Booking kamu akan kedaluwarsa pada {expiresAt}
              </div>
            </div>

            <p style={{ fontSize: 14, color: '#334155', marginBottom: 16 }}>
              Halo <strong>{passengerName}</strong>,
            </p>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 20 }}>
              Booking kamu untuk perjalanan <strong>{origin} → {destination}</strong> dengan kode{' '}
              <strong style={{ color: '#1A56DB', fontFamily: 'monospace' }}>{bookingCode}</strong>{' '}
              belum dibayar. Segera selesaikan sebelum waktu habis.
            </p>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <a href={paymentUrl} style={{ display: 'inline-block', backgroundColor: '#EA580C', color: '#FFFFFF', padding: '14px 32px', borderRadius: 8, fontSize: 15, fontWeight: 'bold', textDecoration: 'none' }}>
                Bayar Sekarang →
              </a>
            </div>

            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
              Abaikan email ini jika kamu sudah melakukan pembayaran.
            </div>
          </div>

          {/* Footer */}
          <div style={{ backgroundColor: '#F1F5F9', borderRadius: '0 0 12px 12px', border: '1px solid #E2E8F0', borderTop: 'none', padding: '14px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>© 2026 JaMobility — japanarenacorp.com</div>
          </div>
        </div>
      </body>
    </html>
  )
}
