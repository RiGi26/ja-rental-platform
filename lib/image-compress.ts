// Downscale + convert an image to WebP entirely in the browser (via <canvas>) before
// upload, so stored fleet photos stay small (storage + bandwidth + faster public site).
// Ported from the proven pattern in ja-stock-platform / ja-laundry-platform. No deps.

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.onerror = reject
    el.src = src
  })
}

/**
 * Downscale `file` to at most `maxWidth` px wide and re-encode it as WebP. Returns a new
 * WebP File. Throws if the canvas/toBlob API is unavailable or the image can't be decoded —
 * callers should catch and fall back to the original File so uploads never break.
 */
export async function compressImageToWebp(
  file: File,
  { maxWidth = 1600, quality = 0.85 }: { maxWidth?: number; quality?: number } = {},
): Promise<File> {
  const src = URL.createObjectURL(file)
  try {
    const img = await loadImage(src)
    const sw = img.naturalWidth
    const sh = img.naturalHeight
    if (!sw || !sh) throw new Error('Dimensi gambar tidak terbaca')

    const scale = sw > maxWidth ? maxWidth / sw : 1
    const targetW = Math.round(sw * scale)
    const targetH = Math.round(sh * scale)

    const canvas = document.createElement('canvas')
    canvas.width = targetW
    canvas.height = targetH
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas tidak didukung')
    ctx.drawImage(img, 0, 0, sw, sh, 0, 0, targetW, targetH)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', quality),
    )
    if (!blob) throw new Error('Gagal memproses gambar')
    return new File([blob], 'foto.webp', { type: 'image/webp' })
  } finally {
    URL.revokeObjectURL(src)
  }
}
