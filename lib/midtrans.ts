import { Snap } from 'midtrans-client'

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true'
const serverKey    = process.env.MIDTRANS_SERVER_KEY ?? ''
const clientKey    = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? ''

export const isMockMode = !serverKey || serverKey === 'SB-Mid-server-xxxx'

let _snap: Snap | null = null
function getSnap(): Snap {
  if (!_snap) _snap = new Snap({ isProduction, serverKey, clientKey })
  return _snap
}

export interface SnapTokenParams {
  orderId:       string
  amount:        number
  customerName:  string
  customerEmail: string
  customerPhone: string
  items: { id: string; name: string; price: number; quantity: number }[]
}

export async function createSnapToken(
  params: SnapTokenParams
): Promise<{ token: string; redirectUrl: string }> {
  if (isMockMode) {
    return {
      token:       `mock-token-${params.orderId}`,
      redirectUrl: `/booking/pay/${params.orderId}?mock=true`,
    }
  }

  const res = await getSnap().createTransaction({
    transaction_details: {
      order_id:     params.orderId,
      gross_amount: params.amount,
    },
    customer_details: {
      first_name: params.customerName,
      email:      params.customerEmail || 'customer@example.com',
      phone:      params.customerPhone,
    },
    item_details: params.items,
    expiry: { unit: 'hours', duration: 2 },
  })

  return { token: res.token, redirectUrl: res.redirect_url }
}
