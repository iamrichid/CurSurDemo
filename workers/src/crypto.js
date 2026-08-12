const PBKDF2_ITERATIONS = 100_000

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function generateId() {
  return crypto.randomUUID()
}

export function generateSalt() {
  return toHex(crypto.getRandomValues(new Uint8Array(16)))
}

export async function hashPassword(password, salt) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  )
  return toHex(bits)
}

export async function hashApiKey(apiKey) {
  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(apiKey)
  )
  return toHex(hash)
}

export function generateApiKey() {
  const secret = toHex(crypto.getRandomValues(new Uint8Array(18)))
  return `a3_live_sk_${secret}`
}

export function maskApiKey(apiKey) {
  if (!apiKey || apiKey.length < 16) return apiKey
  return `${apiKey.slice(0, 12)}••••••••${apiKey.slice(-4)}`
}

export function initialsFromOrg(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'A3'
}
