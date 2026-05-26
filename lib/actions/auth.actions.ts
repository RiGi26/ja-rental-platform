'use server'

import { createRentalServiceClient } from '@/lib/supabase/service'

export async function claimGuestBooking(bookingCode: string, userId: string) {
  const supabase = createRentalServiceClient()
  const { error } = await supabase
    .from('bookings')
    .update({ customer_id: userId })
    .eq('booking_code', bookingCode)
    .is('customer_id', null)

  if (error) {
    console.error('[CLAIM BOOKING]', error)
    return { success: false }
  }
  return { success: true }
}
