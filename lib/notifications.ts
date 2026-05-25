// WhatsApp Cloud API via Meta — notifikasi otomatis per trigger event

interface WAMessage {
  to: string    // format: 62xxx (tanpa +)
  message: string
}

export async function sendWhatsApp({ to, message }: WAMessage): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN!
  const phoneId = process.env.WHATSAPP_PHONE_ID!

  await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message },
    }),
  })
}

// Template messages sesuai PRD section 7.8
export const notifTemplates = {
  bookingCreated: (bookingCode: string, paymentLink: string) =>
    `Halo! Booking Anda *${bookingCode}* telah kami terima.\n\nSegera selesaikan pembayaran:\n${paymentLink}\n\n_JA Travel_`,

  paymentSuccess: (bookingCode: string, ticketLink: string) =>
    `✅ Pembayaran berhasil!\n\nBooking *${bookingCode}* sudah dikonfirmasi.\nUnduh e-tiket Anda:\n${ticketLink}\n\n_JA Travel_`,

  reminderH1: (bookingCode: string, pickupPoint: string, departTime: string) =>
    `⏰ Pengingat perjalanan!\n\nBesok Anda akan berangkat.\nBooking: *${bookingCode}*\nTitik jemput: ${pickupPoint}\nJam: ${departTime}\n\n_JA Travel_`,

  driverOtw: (driverName: string, trackingLink: string) =>
    `🚐 Driver *${driverName}* sedang menuju lokasi jemput Anda.\n\nPantau posisi:\n${trackingLink}\n\n_JA Travel_`,

  tripDone: (bookingCode: string, ratingLink: string) =>
    `Terima kasih telah menggunakan JA Travel! 🙏\n\nBooking *${bookingCode}* telah selesai.\nBeri rating perjalanan Anda:\n${ratingLink}`,
}
