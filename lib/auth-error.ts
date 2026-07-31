import { isAuthRetryableFetchError } from '@supabase/supabase-js'

/**
 * Membedakan "server auth tidak bisa dihubungi" dari "kredensial salah".
 *
 * supabase-js membungkus kegagalan jaringan — DNS mati, project Supabase sedang
 * paused, koneksi putus — menjadi `AuthRetryableFetchError` dengan pesan mentah
 * "fetch failed". Tanpa dipisahkan, gangguan server tampil ke pengguna sebagai
 * "email atau password salah": pengguna disalahkan atas hal yang bukan salahnya,
 * dan kita ikut kehilangan sinyal bahwa yang terjadi sebenarnya insiden.
 */
export function isConnectionError(error: unknown): boolean {
  return isAuthRetryableFetchError(error)
}

/**
 * Satu sumber kalimat untuk gangguan koneksi, dipakai halaman login dan demo.
 * Jujur soal penyebabnya, dan memberi jalan keluar yang bisa ditempuh pengguna.
 */
export const CONNECTION_ERROR_MESSAGE =
  'Server sedang tidak bisa dihubungi, jadi ini bukan soal password Anda. Coba lagi beberapa saat lagi — kalau masih sama, hubungi admin lewat WhatsApp.'
