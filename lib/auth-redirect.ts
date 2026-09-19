export const RENTAL_APP_ORIGIN = 'https://rent.webzoka.com'
export const RENTAL_DEFAULT_PATH = '/'

const PROTECTED_PREFIXES = [
  '/account',
  '/admin',
  '/booking',
  '/driver',
  '/owner',
  '/superadmin',
] as const

function fullyDecode(value: string): string | null {
  let decoded = value
  try {
    for (let index = 0; index < 4; index += 1) {
      const next = decodeURIComponent(decoded)
      if (next === decoded) return decoded
      decoded = next
    }
    return decoded
  } catch {
    return null
  }
}

export function safeRentalNextPath(
  value: string | null | undefined,
  fallback = RENTAL_DEFAULT_PATH,
): string {
  if (!value || !/^\/(?!\/)/.test(value)) return fallback

  const decoded = fullyDecode(value)
  if (
    !decoded ||
    !/^\/(?!\/)/.test(decoded) ||
    decoded.includes('\\') ||
    decoded.includes('#') ||
    /^\/[a-z][a-z\d+.-]*:/i.test(decoded)
  ) {
    return fallback
  }

  try {
    const parsed = new URL(value, RENTAL_APP_ORIGIN)
    if (
      parsed.origin !== RENTAL_APP_ORIGIN ||
      parsed.username ||
      parsed.password ||
      parsed.hash
    ) {
      return fallback
    }

    const allowed = PROTECTED_PREFIXES.some(
      prefix => parsed.pathname === prefix || parsed.pathname.startsWith(`${prefix}/`),
    )
    return allowed ? `${parsed.pathname}${parsed.search}` : fallback
  } catch {
    return fallback
  }
}

