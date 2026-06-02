import QRCode from 'qrcode'

export async function generateQRDataURL(bookingCode: string): Promise<string> {
  const content = JSON.stringify({
    bookingCode,
    type: 'travel',
    version: 1,
    issuer: 'JaMobility',
  })

  return QRCode.toDataURL(content, {
    width: 200,
    margin: 2,
    color: {
      dark: '#1E293B',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  })
}
