import React from 'react'

interface Props {
  passengerName: string
  bookingCode:   string
  origin:        string
  destination:   string
  departAt:      string
  pickupPoint:   string
  trackingUrl:   string
}

export function DepartureReminderEmail(props: Props): React.ReactElement {
  const { passengerName, bookingCode, origin, destination, departAt, pickupPoint, trackingUrl } = props

  return (
    <html lang="id">
      <head><meta charSet="utf-8" /></head>
      <body style={{ margin: 0, padding: '24px 16px', backgroundColor: '#F8FAFC', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ backgroundColor: '#1A56DB', borderRadius: '12px 12px 0 0', padding: '24px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' }}>🚌 JaTravel</div>
          </div>

          {/* Body */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '32px', border: '1px solid #E2E8F0', borderTop: 'none' }}>

            <div style={{ backgroundColor: '#EFF6FF', borderRadius: 8, padding: '16px 20px', marginBottom: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>🗓</div>
              <div style={{ fontSize: 17, fontWeight: 'bold', color: '#1E40AF' }}>Keberangkatan Besok!</div>
            </div>

            <p style={{ fontSize: 14, color: '#334155', marginBottom: 16 }}>
              Halo <strong>{passengerName}</strong>, ini pengingat perjalananmu besok:
            </p>

            <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: 24 }}>
              <tbody>
                {[
                  ['📍 Rute',        `${origin} → ${destination}`],
                  ['📅 Keberangkatan', departAt],
                  ['🚏 Titik Jemput', pickupPoint || '-'],
                  ['🎫 Kode Booking', bookingCode],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td style={{ padding: '7px 0', fontSize: 13, color: '#64748B', width: '40%' }}>{label}</td>
                    <td style={{ padding: '7px 0', fontSize: 13, fontWeight: 'bold', color: '#1E293B' }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ backgroundColor: '#FEF9C3', border: '1px solid #FDE047', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#854D0E', marginBottom: 20 }}>
              ⚠ Harap hadir di titik jemput minimal <strong>15 menit</strong> sebelum keberangkatan.
            </div>

            <div style={{ textAlign: 'center' }}>
              <a href={trackingUrl} style={{ display: 'inline-block', backgroundColor: '#1A56DB', color: '#FFFFFF', padding: '12px 28px', borderRadius: 8, fontSize: 14, fontWeight: 'bold', textDecoration: 'none' }}>
                📍 Tracking Perjalanan
              </a>
            </div>
          </div>

          {/* Footer */}
          <div style={{ backgroundColor: '#F1F5F9', borderRadius: '0 0 12px 12px', border: '1px solid #E2E8F0', borderTop: 'none', padding: '14px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>© 2026 JaTravel — japanarenacorp.com</div>
          </div>
        </div>
      </body>
    </html>
  )
}
