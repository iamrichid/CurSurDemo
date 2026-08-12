export const FREE_TIER_MONTHLY = 500
export const RATE_LIMIT_PER_MINUTE = 40
export const COST_PER_CALL = 0.1

export function monthStartMs(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime()
}

export async function getMonthlyQuoteCount(db, accountId) {
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS count
       FROM quote_logs
       WHERE account_id = ? AND created_at >= ? AND success = 1`
    )
    .bind(accountId, monthStartMs())
    .first()

  return row?.count || 0
}

export async function getRecentQuoteCount(db, accountId, windowMs = 60_000) {
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS count
       FROM quote_logs
       WHERE account_id = ? AND created_at >= ? AND success = 1`
    )
    .bind(accountId, Date.now() - windowMs)
    .first()

  return row?.count || 0
}

export async function checkRateLimit(db, accountId) {
  const count = await getRecentQuoteCount(db, accountId)
  if (count >= RATE_LIMIT_PER_MINUTE) {
    return { ok: false, retryAfter: 60 }
  }
  return { ok: true }
}

export function shouldChargeForQuote(monthlyUsed) {
  return monthlyUsed >= FREE_TIER_MONTHLY
}

export async function getPlanStatus(db, accountId) {
  const used = await getMonthlyQuoteCount(db, accountId)
  const remaining = Math.max(0, FREE_TIER_MONTHLY - used)

  return {
    plan: 'free',
    free_tier_limit: FREE_TIER_MONTHLY,
    free_tier_used: used,
    free_tier_remaining: remaining,
    on_payg: used >= FREE_TIER_MONTHLY,
    payg_cost_per_call: COST_PER_CALL,
    rate_limit_per_minute: RATE_LIMIT_PER_MINUTE,
    billing_period_start: monthStartMs(),
  }
}
