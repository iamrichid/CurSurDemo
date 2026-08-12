import { generateId } from './crypto.js'

export const WELCOME_CREDIT = 10
export const MIN_TOPUP = 1
export const MAX_TOPUP = 500

const VALID_PROVIDERS = new Set(['mtn', 'telecel', 'at'])

export function normalizeGhanaPhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (digits.length === 10 && digits.startsWith('0')) return digits
  if (digits.length === 9) return `0${digits}`
  return null
}

export function validateTopUpRequest({ provider, phone, amount }) {
  if (!VALID_PROVIDERS.has(provider)) {
    return { ok: false, message: 'Unsupported Mobile Money provider.' }
  }

  const normalized = normalizeGhanaPhone(phone)
  if (!normalized) {
    return { ok: false, message: 'Enter a valid Ghana mobile number.' }
  }

  const value = Number(amount)
  if (!Number.isFinite(value) || value < MIN_TOPUP || value > MAX_TOPUP) {
    return {
      ok: false,
      message: `Amount must be between GH₵ ${MIN_TOPUP} and GH₵ ${MAX_TOPUP}.`,
    }
  }

  const prefix = normalized.slice(0, 3)
  const expected = {
    mtn: ['024', '025', '053', '054', '055', '059'],
    telecel: ['020', '050'],
    at: ['027', '057', '026', '056'],
  }

  if (!expected[provider].includes(prefix)) {
    return {
      ok: false,
      message: `Number prefix ${prefix} does not match ${provider.toUpperCase()}.`,
    }
  }

  return {
    ok: true,
    value: Math.round(value * 100) / 100,
    phone: normalized,
    provider,
  }
}

export async function getWallet(db, accountId, limit = 10) {
  const account = await db
    .prepare('SELECT wallet_balance FROM accounts WHERE id = ?')
    .bind(accountId)
    .first()

  const txRows = await db
    .prepare(
      `SELECT id, type, amount, balance_after, provider, phone, description, status, created_at
       FROM wallet_transactions
       WHERE account_id = ?
       ORDER BY created_at DESC
       LIMIT ?`
    )
    .bind(accountId, limit)
    .all()

  return {
    balance: Math.round((account?.wallet_balance || 0) * 100) / 100,
    cost_per_call: 0.1,
    transactions: (txRows.results || []).map(formatTransaction),
  }
}

function formatTransaction(row) {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    balance_after: row.balance_after,
    provider: row.provider,
    phone: row.phone,
    description: row.description,
    status: row.status,
    created_at: row.created_at,
  }
}

export async function creditWallet(db, accountId, payload) {
  const account = await db
    .prepare('SELECT wallet_balance FROM accounts WHERE id = ?')
    .bind(accountId)
    .first()

  if (!account) return null

  const amount = Math.round(payload.amount * 100) / 100
  const balanceAfter = Math.round((account.wallet_balance + amount) * 100) / 100
  const now = Date.now()
  const txId = generateId()
  const reference = payload.reference || `topup_${txId.slice(0, 8)}`

  await db.batch([
    db
      .prepare('UPDATE accounts SET wallet_balance = ? WHERE id = ?')
      .bind(balanceAfter, accountId),
    db
      .prepare(
        `INSERT INTO wallet_transactions (
          id, account_id, type, amount, balance_after,
          provider, phone, reference, status, description, created_at
        ) VALUES (?, ?, 'topup', ?, ?, ?, ?, ?, 'completed', ?, ?)`
      )
      .bind(
        txId,
        accountId,
        amount,
        balanceAfter,
        payload.provider || null,
        payload.phone || null,
        reference,
        payload.description || 'MoMo wallet top-up',
        now
      ),
  ])

  return { balance: balanceAfter, transaction_id: txId, reference }
}

export async function addWelcomeCredit(db, accountId) {
  return creditWallet(db, accountId, {
    amount: WELCOME_CREDIT,
    description: 'Welcome credit — 100 free API calls',
    reference: `welcome_${accountId.slice(0, 8)}`,
  })
}

export async function debitForApiCall(db, accountId, costPerCall) {
  const result = await db
    .prepare(
      `UPDATE accounts
       SET wallet_balance = ROUND(wallet_balance - ?, 2)
       WHERE id = ? AND wallet_balance >= ?`
    )
    .bind(costPerCall, accountId, costPerCall)
    .run()

  if (!result.meta.changes) {
    const account = await db
      .prepare('SELECT wallet_balance FROM accounts WHERE id = ?')
      .bind(accountId)
      .first()
    return {
      ok: false,
      balance: account?.wallet_balance || 0,
    }
  }

  const account = await db
    .prepare('SELECT wallet_balance FROM accounts WHERE id = ?')
    .bind(accountId)
    .first()

  const balanceAfter = account.wallet_balance
  const now = Date.now()
  const txId = generateId()

  await db
    .prepare(
      `INSERT INTO wallet_transactions (
        id, account_id, type, amount, balance_after,
        reference, status, description, created_at
      ) VALUES (?, ?, 'debit', ?, ?, ?, 'completed', 'API quote request', ?)`
    )
    .bind(
      txId,
      accountId,
      -costPerCall,
      balanceAfter,
      `quote_${txId.slice(0, 8)}`,
      now
    )
    .run()

  return { ok: true, balance: balanceAfter, transaction_id: txId }
}

export async function processTopUp(db, accountId, input) {
  const validated = validateTopUpRequest(input)
  if (!validated.ok) {
    return { ok: false, message: validated.message }
  }

  const providerNames = {
    mtn: 'MTN MoMo',
    telecel: 'Telecel Cash',
    at: 'AT Money',
  }

  const credited = await creditWallet(db, accountId, {
    amount: validated.value,
    provider: validated.provider,
    phone: validated.phone,
    description: `${providerNames[validated.provider]} top-up`,
    reference: `momo_${validated.provider}_${Date.now()}`,
  })

  return {
    ok: true,
    balance: credited.balance,
    amount: validated.value,
    provider: validated.provider,
    phone: validated.phone,
    reference: credited.reference,
    transaction_id: credited.transaction_id,
    mode: 'sandbox',
  }
}

export async function getSpendLast7Days(db, accountId, since) {
  const row = await db
    .prepare(
      `SELECT COALESCE(SUM(ABS(amount)), 0) AS spend
       FROM wallet_transactions
       WHERE account_id = ? AND type = 'debit' AND created_at >= ?`
    )
    .bind(accountId, since)
    .first()

  return Math.round((row?.spend || 0) * 100) / 100
}
