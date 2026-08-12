import { defaultRates } from '../../src/utils/pricing.js'
import {
  generateApiKey,
  generateId,
  hashApiKey,
  hashPassword,
  maskApiKey,
} from './crypto.js'

const COST_PER_CALL = 0.1
const DAY_MS = 86_400_000

export { COST_PER_CALL }

export function hasDatabase(env) {
  return Boolean(env.DB)
}

export async function findAccountByEmail(db, email) {
  return db
    .prepare('SELECT * FROM accounts WHERE email = ?')
    .bind(email.toLowerCase().trim())
    .first()
}

export async function findAccountById(db, id) {
  return db.prepare('SELECT * FROM accounts WHERE id = ?').bind(id).first()
}

export async function findApiKeyByHash(db, keyHash) {
  return db
    .prepare(
      `SELECT api_keys.*, accounts.org_name, accounts.email, accounts.wallet_balance
       FROM api_keys
       JOIN accounts ON accounts.id = api_keys.account_id
       WHERE api_keys.key_hash = ? AND api_keys.revoked_at IS NULL`
    )
    .bind(keyHash)
    .first()
}

export async function createAccountWithKey(db, { orgName, email, password }) {
  const accountId = generateId()
  const salt = crypto.randomUUID().replace(/-/g, '').slice(0, 32)
  const passwordHash = await hashPassword(password, salt)
  const apiKey = generateApiKey()
  const keyHash = await hashApiKey(apiKey)
  const keyId = generateId()
  const now = Date.now()

  await db.batch([
    db
      .prepare(
        `INSERT INTO accounts (id, org_name, email, password_hash, password_salt, wallet_balance, created_at)
         VALUES (?, ?, ?, ?, ?, 0, ?)`
      )
      .bind(accountId, orgName.trim(), email.toLowerCase().trim(), passwordHash, salt, now),
    db
      .prepare(
        `INSERT INTO api_keys (id, account_id, key_hash, key_prefix, label, created_at)
         VALUES (?, ?, ?, ?, 'Default', ?)`
      )
      .bind(keyId, accountId, keyHash, maskApiKey(apiKey), now),
    db
      .prepare(
        `INSERT INTO rate_configs (account_id, rates_json, updated_at)
         VALUES (?, ?, ?)`
      )
      .bind(accountId, JSON.stringify(defaultRates), now),
  ])

  return {
    account: {
      id: accountId,
      org_name: orgName.trim(),
      email: email.toLowerCase().trim(),
    },
    api_key: apiKey,
    key_prefix: maskApiKey(apiKey),
  }
}

export async function loginAccount(db, { email, password }) {
  const account = await findAccountByEmail(db, email)
  if (!account) return null

  const passwordHash = await hashPassword(password, account.password_salt)
  if (passwordHash !== account.password_hash) return null

  const keyRow = await db
    .prepare(
      `SELECT id, key_prefix FROM api_keys
       WHERE account_id = ? AND revoked_at IS NULL
       ORDER BY created_at ASC LIMIT 1`
    )
    .bind(account.id)
    .first()

  return {
    account: {
      id: account.id,
      org_name: account.org_name,
      email: account.email,
      wallet_balance: account.wallet_balance,
    },
    key_prefix: keyRow?.key_prefix || null,
  }
}

export async function regenerateApiKey(db, { email, password }) {
  const account = await findAccountByEmail(db, email)
  if (!account) return null

  const passwordHash = await hashPassword(password, account.password_salt)
  if (passwordHash !== account.password_hash) return null

  const rotated = await rotateApiKey(db, account.id)
  return {
    account: {
      id: account.id,
      org_name: account.org_name,
      email: account.email,
      wallet_balance: account.wallet_balance,
    },
    ...rotated,
  }
}

export async function rotateApiKey(db, accountId) {
  const apiKey = generateApiKey()
  const keyHash = await hashApiKey(apiKey)
  const keyId = generateId()
  const now = Date.now()

  await db.batch([
    db
      .prepare('UPDATE api_keys SET revoked_at = ? WHERE account_id = ? AND revoked_at IS NULL')
      .bind(now, accountId),
    db
      .prepare(
        `INSERT INTO api_keys (id, account_id, key_hash, key_prefix, label, created_at)
         VALUES (?, ?, ?, ?, 'Default', ?)`
      )
      .bind(keyId, accountId, keyHash, maskApiKey(apiKey), now),
  ])

  return { api_key: apiKey, key_prefix: maskApiKey(apiKey) }
}

export async function getRates(db, accountId) {
  const row = await db
    .prepare('SELECT rates_json FROM rate_configs WHERE account_id = ?')
    .bind(accountId)
    .first()

  if (!row) return structuredClone(defaultRates)
  try {
    return JSON.parse(row.rates_json)
  } catch {
    return structuredClone(defaultRates)
  }
}

export async function saveRates(db, accountId, rates) {
  const now = Date.now()
  await db
    .prepare(
      `INSERT INTO rate_configs (account_id, rates_json, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(account_id) DO UPDATE SET rates_json = excluded.rates_json, updated_at = excluded.updated_at`
    )
    .bind(accountId, JSON.stringify(rates), now)
    .run()
}

export async function logQuote(db, payload) {
  await db
    .prepare(
      `INSERT INTO quote_logs (
        id, account_id, api_key_id, vehicle,
        origin_lat, origin_lng, dest_lat, dest_lng,
        distance_km, duration_mins, price_ghs, latency_ms, success, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`
    )
    .bind(
      generateId(),
      payload.accountId,
      payload.apiKeyId,
      payload.vehicle,
      payload.origin.lat,
      payload.origin.lng,
      payload.destination.lat,
      payload.destination.lng,
      payload.distanceKm,
      payload.durationMins,
      payload.priceGhs,
      payload.latencyMs,
      Date.now()
    )
    .run()
}

export async function getUsage(db, accountId) {
  const since = Date.now() - 7 * DAY_MS

  const totals = await db
    .prepare(
      `SELECT
         COUNT(*) AS total_calls,
         AVG(latency_ms) AS avg_latency_ms
       FROM quote_logs
       WHERE account_id = ? AND created_at >= ? AND success = 1`
    )
    .bind(accountId, since)
    .first()

  const dailyRows = await db
    .prepare(
      `SELECT
         date(created_at / 1000, 'unixepoch') AS day,
         COUNT(*) AS count
       FROM quote_logs
       WHERE account_id = ? AND created_at >= ? AND success = 1
       GROUP BY day
       ORDER BY day ASC`
    )
    .bind(accountId, since)
    .all()

  const vehicleRows = await db
    .prepare(
      `SELECT vehicle, COUNT(*) AS count
       FROM quote_logs
       WHERE account_id = ? AND created_at >= ? AND success = 1
       GROUP BY vehicle`
    )
    .bind(accountId, since)
    .all()

  const totalCalls = totals?.total_calls || 0
  const avgLatency = Math.round(totals?.avg_latency_ms || 0)

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const chartMap = Object.fromEntries(
    (dailyRows.results || []).map((row) => [row.day, row.count])
  )

  const chart = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * DAY_MS)
    const key = d.toISOString().slice(0, 10)
    chart.push({
      label: labels[d.getDay() === 0 ? 6 : d.getDay() - 1] || labels[0],
      value: chartMap[key] || 0,
      date: key,
    })
  }

  const vehicleCounts = vehicleRows.results || []
  const vehicleTotal = vehicleCounts.reduce((sum, row) => sum + row.count, 0)
  const vehicleBreakdown = vehicleCounts.map((row) => ({
    vehicle: row.vehicle,
    count: row.count,
    pct: vehicleTotal ? Math.round((row.count / vehicleTotal) * 100) : 0,
  }))

  return {
    total_calls: totalCalls,
    total_spend: Math.round(totalCalls * COST_PER_CALL * 100) / 100,
    avg_latency_ms: avgLatency,
    success_rate: totalCalls > 0 ? 100 : 100,
    chart,
    vehicle_breakdown: vehicleBreakdown,
    cost_per_call: COST_PER_CALL,
  }
}
