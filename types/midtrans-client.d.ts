declare module 'midtrans-client' {
  interface SnapConfig {
    isProduction: boolean
    serverKey: string
    clientKey?: string
  }

  interface TransactionDetails {
    order_id: string
    gross_amount: number
  }

  interface ItemDetail {
    id: string
    name: string
    price: number
    quantity: number
  }

  interface CustomerDetails {
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
  }

  interface SnapTransactionParam {
    transaction_details: TransactionDetails
    item_details?: ItemDetail[]
    customer_details?: CustomerDetails
    expiry?: { unit: string; duration: number }
  }

  interface SnapTransactionResponse {
    token: string
    redirect_url: string
  }

  class Snap {
    constructor(config: SnapConfig)
    createTransaction(param: SnapTransactionParam): Promise<SnapTransactionResponse>
  }

  class CoreApi {
    constructor(config: SnapConfig)
  }

  export { Snap, CoreApi }
}
