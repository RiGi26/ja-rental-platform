'use client'

import { useRef, useState } from 'react'
import { ImagePlus, X, Star, Loader2 } from 'lucide-react'

// Reusable fleet-photo uploader. Each file is POSTed to the admin upload route,
// which stores it in the public `vehicle-photos` bucket and returns a public URL.
// The parent holds the URL array (first = primary, shown on the public website).

const UPLOAD_URL = '/api/admin/vehicles/photo'
const MAX_PHOTOS = 12

const ERR: Record<string, string> = {
  unsupported_type: 'Format tidak didukung (JPG/PNG/WebP/AVIF).',
  too_large: 'Ukuran maksimal 5 MB per foto.',
  empty_file: 'File kosong.',
  no_file: 'Tidak ada file.',
  upload_failed: 'Gagal mengunggah. Coba lagi.',
  unauthorized: 'Sesi berakhir. Silakan login ulang.',
  forbidden: 'Akun tidak berwenang.',
}

export default function PhotoUploader({
  value,
  onChange,
}: {
  value: string[]
  onChange: (urls: string[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(0)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    const room = MAX_PHOTOS - value.length
    const picked = Array.from(files).slice(0, Math.max(0, room))
    if (picked.length === 0) {
      setError(`Maksimal ${MAX_PHOTOS} foto.`)
      return
    }

    setUploading((n) => n + picked.length)
    const uploaded: string[] = []
    for (const file of picked) {
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch(UPLOAD_URL, { method: 'POST', body: fd })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) setError(ERR[data?.error as string] ?? 'Gagal mengunggah.')
        else if (data.url) uploaded.push(data.url as string)
      } catch {
        setError('Gagal mengunggah. Periksa koneksi.')
      } finally {
        setUploading((n) => Math.max(0, n - 1))
      }
    }
    if (uploaded.length) onChange([...value, ...uploaded])
    if (inputRef.current) inputRef.current.value = ''
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i))
  }
  function makePrimary(i: number) {
    if (i === 0) return
    const next = [...value]
    const [pick] = next.splice(i, 1)
    next.unshift(pick)
    onChange(next)
  }

  const full = value.length >= MAX_PHOTOS

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {value.map((url, i) => (
          <div key={url} className="relative group aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
            {i === 0 && (
              <span className="absolute top-1 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-600 text-white">
                Utama
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-between p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {i !== 0 ? (
                <button
                  type="button"
                  onClick={() => makePrimary(i)}
                  title="Jadikan foto utama"
                  aria-label="Jadikan foto utama"
                  className="p-1 rounded-md bg-white/90 text-slate-700 hover:text-blue-600 shadow-sm"
                >
                  <Star size={13} />
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                title="Hapus foto"
                aria-label="Hapus foto"
                className="p-1 rounded-md bg-white/90 text-slate-700 hover:text-red-600 shadow-sm"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        ))}

        {Array.from({ length: uploading }).map((_, i) => (
          <div key={`u${i}`} className="aspect-[4/3] rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
            <Loader2 size={18} className="animate-spin text-slate-400" />
          </div>
        ))}

        {!full && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 flex flex-col items-center justify-center gap-1 transition-colors"
          >
            <ImagePlus size={20} />
            <span className="text-[11px] font-semibold">Tambah Foto</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="text-xs text-slate-400">
        Foto pertama (bertanda &ldquo;Utama&rdquo;) yang tampil di website. Maks {MAX_PHOTOS} foto, 5 MB per foto.
      </p>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
