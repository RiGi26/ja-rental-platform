import React from 'react'

interface Props {
  passengerName: string
  bookingCode:   string
  origin:        string
  destination:   string
  departAt:      string
  pickupPoint:   string
  seats:         string[]
  totalAmount:   number
  ticketUrl:     string
  invoiceUrl:    string
}

function formatRp(n: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(n)
}

export function BookingConfirmationEmail(props: Props): React.ReactElement {
  const {
    passengerName, bookingCode, origin, destination,
    departAt, pickupPoint, seats, totalAmount, ticketUrl, invoiceUrl,
  } = props

  const btnBase: React.CSSProperties = {
    display: 'inline-block',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center',
  }

  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: '24px 16px', backgroundColor: '#F8FAFC', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ backgroundColor: '#1A56DB', borderRadius: '12px 12px 0 0', padding: '28px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 'bold', color: '#FFFFFF' }}>🚌 JaMobility</div>
            <div style={{ fontSize: 12, color: '#BFDBFE', marginTop: 4, letterSpacing: 2 }}>E-TICKET PERJALANAN</div>
          </div>

          {/* Body */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '32px', borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }}>

            {/* Success banner */}
            <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '16px 20px', marginBottom: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: '#15803D' }}>Pembayaran Berhasil!</div>
              <div style={{ fontSize: 13, color: '#166534', marginTop: 4 }}>
                Halo {passengerName}, tiket perjalananmu sudah siap.
              </div>
            </div>

            {/* Route details */}
            <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: 24 }}>
              <tbody>
                <tr>
                  <td style={{ backgroundColor: '#EFF6FF', borderRadius: 8, padding: '16px 20px' }}>
                    <div style={{ textAlign: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 20, fontWeight: 'bold', color: '#1E293B' }}>{origin}</span>
                      <span style={{ color: '#1A56DB', margin: '0 12px', fontSize: 18 }}>→</span>
                      <span style={{ fontSize: 20, fontWeight: 'bold', color: '#1E293B' }}>{destination}</span>
                    </div>
                    <table width="100%" cellPadding={0} cellSpacing={0}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '4px 0', fontSize: 13 }}>
                            <span style={{ color: '#64748B' }}>📅 Keberangkatan</span>
                          </td>
                          <td style={{ padding: '4px 0', fontSize: 13, fontWeight: 'bold', color: '#1E293B', textAlign: 'right' }}>
                            {departAt}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '4px 0', fontSize: 13 }}>
                            <span style={{ color: '#64748B' }}>🚏 Titik Jemput</span>
                          </td>
                          <td style={{ padding: '4px 0', fontSize: 13, fontWeight: 'bold', color: '#1E293B', textAlign: 'right' }}>
                            {pickupPoint || '-'}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '4px 0', fontSize: 13 }}>
                            <span style={{ color: '#64748B' }}>💺 Kursi</span>
                          </td>
                          <td style={{ padding: '4px 0', fontSize: 13, fontWeight: 'bold', color: '#1E293B', textAlign: 'right' }}>
                            {seats.join(', ')}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Booking code */}
            <div style={{ textAlign: 'center', marginBottom: 24, padding: '16px', border: '1px dashed #CBD5E1', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#64748B', letterSpacing: 2, marginBottom: 6 }}>KODE BOOKING</div>
              <div style={{ fontSize: 26, fontWeight: 'bold', color: '#1A56DB', fontFamily: 'Courier New, monospace', letterSpacing: 3 }}>
                {bookingCode}
              </div>
              <div style={{ marginTop: 8, fontSize: 13, color: '#15803D', fontWeight: 'bold' }}>
                {formatRp(totalAmount)} — LUNAS ✓
              </div>
            </div>

            {/* Download buttons */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <a href={ticketUrl} style={{ ...btnBase, backgroundColor: '#1A56DB', color: '#FFFFFF', marginRight: 12 }}>
                📄 Download E-Ticket
              </a>
              <a href={invoiceUrl} style={{ ...btnBase, backgroundColor: '#FFFFFF', color: '#1A56DB', border: '2px solid #1A56DB' }}>
                🧾 Download Invoice
              </a>
            </div>

            {/* Info */}
            <div style={{ backgroundColor: '#FEF9C3', border: '1px solid #FDE047', borderRadius: 8, padding: '12px 16px', fontSize: 12, color: '#854D0E' }}>
              ⚠ Harap hadir di titik jemput minimal 15 menit sebelum keberangkatan.
              Tunjukkan kode booking ini kepada pengemudi saat boarding.
            </div>
          </div>

          {/* Footer */}
          <div style={{ backgroundColor: '#F1F5F9', borderRadius: '0 0 12px 12px', borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '16px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>
              © 2026 JaMobility — PT Japan Arena Corp
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
              japanarenacorp.com · noreply@japanarenacorp.com
            </div>
          </div>

        </div>
      </body>
    </html>
  )
}
