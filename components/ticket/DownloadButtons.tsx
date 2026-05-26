'use client'

interface Props {
  bookingCode: string
}

export function DownloadButtons({ bookingCode }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <a
        href={`/api/ticket/${bookingCode}/pdf`}
        download={`eticket-${bookingCode}.pdf`}
        className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold
                   bg-primary text-white hover:bg-primary-hover px-4 py-3 rounded-xl
                   transition-colors shadow-glow"
      >
        <span>📄</span>
        Download E-Ticket PDF
      </a>
      <a
        href={`/api/ticket/${bookingCode}/invoice`}
        download={`invoice-${bookingCode}.pdf`}
        className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold
                   text-primary bg-white border border-primary/30 hover:bg-blue-50
                   px-4 py-3 rounded-xl transition-colors"
      >
        <span>🧾</span>
        Download Invoice
      </a>
    </div>
  )
}
