var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_modules_watch_stub();
  }
});

// node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// ../src/utils/pricing.js
var pricing_exports = {};
__export(pricing_exports, {
  buildQuoteResponse: () => buildQuoteResponse,
  calculateQuote: () => calculateQuote,
  defaultRates: () => defaultRates,
  getMockRoute: () => getMockRoute,
  vehicleTypes: () => vehicleTypes
});
function calculateQuote(rates, vehicle, distanceKm, durationMins) {
  const rate = rates[vehicle];
  if (!rate) return null;
  const price = rate.baseFare + distanceKm * rate.perKm + durationMins * rate.perMinute;
  return {
    vehicle: rate.label,
    distance_km: Math.round(distanceKm * 10) / 10,
    duration_mins: Math.round(durationMins),
    price_ghs: Math.round(price * 100) / 100,
    currency: "GHS"
  };
}
function getMockRoute() {
  return {
    origin: {
      name: "East Legon, Accra",
      address: "East Legon, Accra",
      lat: 5.638,
      lng: -0.154
    },
    destination: {
      name: "Circle, Accra",
      address: "Circle, Accra",
      lat: 5.571,
      lng: -0.214
    },
    distanceKm: 8.4,
    durationMins: 24
  };
}
function routePointFromInput(input, fallback) {
  if (typeof input === "string" && input.trim()) {
    return { ...fallback, address: input.trim(), name: input.trim() };
  }
  if (input?.address) {
    return {
      ...fallback,
      address: input.address,
      name: input.label || input.address,
      lat: input.lat ?? fallback.lat,
      lng: input.lng ?? fallback.lng
    };
  }
  if (typeof input?.lat === "number" && typeof input?.lng === "number") {
    return {
      ...fallback,
      lat: input.lat,
      lng: input.lng,
      name: input.label || fallback.name
    };
  }
  return fallback;
}
function buildQuoteResponse(rates, vehicle, route, { originInput, destinationInput } = {}) {
  const quote = calculateQuote(
    rates,
    vehicle,
    route.distanceKm,
    route.durationMins
  );
  if (!quote) return null;
  const origin = routePointFromInput(originInput, route.origin);
  const destination = routePointFromInput(destinationInput, route.destination);
  return {
    status: "success",
    route: {
      origin: {
        label: origin.name,
        lat: origin.lat,
        lng: origin.lng,
        ...origin.address ? { address: origin.address } : {}
      },
      destination: {
        label: destination.name,
        lat: destination.lat,
        lng: destination.lng,
        ...destination.address ? { address: destination.address } : {}
      }
    },
    ...quote
  };
}
var defaultRates, vehicleTypes;
var init_pricing = __esm({
  "../src/utils/pricing.js"() {
    init_modules_watch_stub();
    defaultRates = {
      bicycle: { baseFare: 5, perKm: 1.2, perMinute: 0.15, label: "Bicycle" },
      motorbike: { baseFare: 8, perKm: 1.8, perMinute: 0.25, label: "Motorbike (Okada)" },
      car: { baseFare: 15, perKm: 3.5, perMinute: 0.45, label: "Car" }
    };
    vehicleTypes = ["bicycle", "motorbike", "car"];
    __name(calculateQuote, "calculateQuote");
    __name(getMockRoute, "getMockRoute");
    __name(routePointFromInput, "routePointFromInput");
    __name(buildQuoteResponse, "buildQuoteResponse");
  }
});

// src/crypto.js
function toHex(buffer) {
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function generateId() {
  return crypto.randomUUID();
}
async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );
  return toHex(bits);
}
async function hashApiKey(apiKey) {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(apiKey)
  );
  return toHex(hash);
}
function generateApiKey() {
  const secret = toHex(crypto.getRandomValues(new Uint8Array(18)));
  return `a3_live_sk_${secret}`;
}
function maskApiKey(apiKey) {
  if (!apiKey || apiKey.length < 16) return apiKey;
  return `${apiKey.slice(0, 12)}\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022${apiKey.slice(-4)}`;
}
var PBKDF2_ITERATIONS;
var init_crypto = __esm({
  "src/crypto.js"() {
    init_modules_watch_stub();
    PBKDF2_ITERATIONS = 1e5;
    __name(toHex, "toHex");
    __name(generateId, "generateId");
    __name(hashPassword, "hashPassword");
    __name(hashApiKey, "hashApiKey");
    __name(generateApiKey, "generateApiKey");
    __name(maskApiKey, "maskApiKey");
  }
});

// src/wallet.js
function normalizeGhanaPhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("0")) return digits;
  if (digits.length === 9) return `0${digits}`;
  return null;
}
function validateTopUpRequest({ provider, phone, amount }) {
  if (!VALID_PROVIDERS.has(provider)) {
    return { ok: false, message: "Unsupported Mobile Money provider." };
  }
  const normalized = normalizeGhanaPhone(phone);
  if (!normalized) {
    return { ok: false, message: "Enter a valid Ghana mobile number." };
  }
  const value = Number(amount);
  if (!Number.isFinite(value) || value < MIN_TOPUP || value > MAX_TOPUP) {
    return {
      ok: false,
      message: `Amount must be between GH\u20B5 ${MIN_TOPUP} and GH\u20B5 ${MAX_TOPUP}.`
    };
  }
  const prefix = normalized.slice(0, 3);
  const expected = {
    mtn: ["024", "025", "053", "054", "055", "059"],
    telecel: ["020", "050"],
    at: ["027", "057", "026", "056"]
  };
  if (!expected[provider].includes(prefix)) {
    return {
      ok: false,
      message: `Number prefix ${prefix} does not match ${provider.toUpperCase()}.`
    };
  }
  return {
    ok: true,
    value: Math.round(value * 100) / 100,
    phone: normalized,
    provider
  };
}
async function getWallet(db, accountId, limit = 10) {
  const account = await db.prepare("SELECT wallet_balance FROM accounts WHERE id = ?").bind(accountId).first();
  const txRows = await db.prepare(
    `SELECT id, type, amount, balance_after, provider, phone, description, status, created_at
       FROM wallet_transactions
       WHERE account_id = ?
       ORDER BY created_at DESC
       LIMIT ?`
  ).bind(accountId, limit).all();
  return {
    balance: Math.round((account?.wallet_balance || 0) * 100) / 100,
    cost_per_call: 0.1,
    transactions: (txRows.results || []).map(formatTransaction)
  };
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
    created_at: row.created_at
  };
}
async function creditWallet(db, accountId, payload) {
  const account = await db.prepare("SELECT wallet_balance FROM accounts WHERE id = ?").bind(accountId).first();
  if (!account) return null;
  const amount = Math.round(payload.amount * 100) / 100;
  const balanceAfter = Math.round((account.wallet_balance + amount) * 100) / 100;
  const now = Date.now();
  const txId = generateId();
  const reference = payload.reference || `topup_${txId.slice(0, 8)}`;
  await db.batch([
    db.prepare("UPDATE accounts SET wallet_balance = ? WHERE id = ?").bind(balanceAfter, accountId),
    db.prepare(
      `INSERT INTO wallet_transactions (
          id, account_id, type, amount, balance_after,
          provider, phone, reference, status, description, created_at
        ) VALUES (?, ?, 'topup', ?, ?, ?, ?, ?, 'completed', ?, ?)`
    ).bind(
      txId,
      accountId,
      amount,
      balanceAfter,
      payload.provider || null,
      payload.phone || null,
      reference,
      payload.description || "MoMo wallet top-up",
      now
    )
  ]);
  return { balance: balanceAfter, transaction_id: txId, reference };
}
async function addWelcomeCredit(db, accountId) {
  return creditWallet(db, accountId, {
    amount: WELCOME_CREDIT,
    description: "Welcome credit \u2014 100 free API calls",
    reference: `welcome_${accountId.slice(0, 8)}`
  });
}
async function debitForApiCall(db, accountId, costPerCall) {
  const result = await db.prepare(
    `UPDATE accounts
       SET wallet_balance = ROUND(wallet_balance - ?, 2)
       WHERE id = ? AND wallet_balance >= ?`
  ).bind(costPerCall, accountId, costPerCall).run();
  if (!result.meta.changes) {
    const account2 = await db.prepare("SELECT wallet_balance FROM accounts WHERE id = ?").bind(accountId).first();
    return {
      ok: false,
      balance: account2?.wallet_balance || 0
    };
  }
  const account = await db.prepare("SELECT wallet_balance FROM accounts WHERE id = ?").bind(accountId).first();
  const balanceAfter = account.wallet_balance;
  const now = Date.now();
  const txId = generateId();
  await db.prepare(
    `INSERT INTO wallet_transactions (
        id, account_id, type, amount, balance_after,
        reference, status, description, created_at
      ) VALUES (?, ?, 'debit', ?, ?, ?, 'completed', 'API quote request', ?)`
  ).bind(
    txId,
    accountId,
    -costPerCall,
    balanceAfter,
    `quote_${txId.slice(0, 8)}`,
    now
  ).run();
  return { ok: true, balance: balanceAfter, transaction_id: txId };
}
async function processTopUp(db, accountId, input) {
  const validated = validateTopUpRequest(input);
  if (!validated.ok) {
    return { ok: false, message: validated.message };
  }
  const providerNames = {
    mtn: "MTN MoMo",
    telecel: "Telecel Cash",
    at: "AT Money"
  };
  const credited = await creditWallet(db, accountId, {
    amount: validated.value,
    provider: validated.provider,
    phone: validated.phone,
    description: `${providerNames[validated.provider]} top-up`,
    reference: `momo_${validated.provider}_${Date.now()}`
  });
  return {
    ok: true,
    balance: credited.balance,
    amount: validated.value,
    provider: validated.provider,
    phone: validated.phone,
    reference: credited.reference,
    transaction_id: credited.transaction_id,
    mode: "sandbox"
  };
}
async function getSpendLast7Days(db, accountId, since) {
  const row = await db.prepare(
    `SELECT COALESCE(SUM(ABS(amount)), 0) AS spend
       FROM wallet_transactions
       WHERE account_id = ? AND type = 'debit' AND created_at >= ?`
  ).bind(accountId, since).first();
  return Math.round((row?.spend || 0) * 100) / 100;
}
var WELCOME_CREDIT, MIN_TOPUP, MAX_TOPUP, VALID_PROVIDERS;
var init_wallet = __esm({
  "src/wallet.js"() {
    init_modules_watch_stub();
    init_crypto();
    WELCOME_CREDIT = 10;
    MIN_TOPUP = 1;
    MAX_TOPUP = 500;
    VALID_PROVIDERS = /* @__PURE__ */ new Set(["mtn", "telecel", "at"]);
    __name(normalizeGhanaPhone, "normalizeGhanaPhone");
    __name(validateTopUpRequest, "validateTopUpRequest");
    __name(getWallet, "getWallet");
    __name(formatTransaction, "formatTransaction");
    __name(creditWallet, "creditWallet");
    __name(addWelcomeCredit, "addWelcomeCredit");
    __name(debitForApiCall, "debitForApiCall");
    __name(processTopUp, "processTopUp");
    __name(getSpendLast7Days, "getSpendLast7Days");
  }
});

// src/plans.js
function monthStartMs(date = /* @__PURE__ */ new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
}
async function getMonthlyQuoteCount(db, accountId) {
  const row = await db.prepare(
    `SELECT COUNT(*) AS count
       FROM quote_logs
       WHERE account_id = ? AND created_at >= ? AND success = 1`
  ).bind(accountId, monthStartMs()).first();
  return row?.count || 0;
}
async function getRecentQuoteCount(db, accountId, windowMs = 6e4) {
  const row = await db.prepare(
    `SELECT COUNT(*) AS count
       FROM quote_logs
       WHERE account_id = ? AND created_at >= ? AND success = 1`
  ).bind(accountId, Date.now() - windowMs).first();
  return row?.count || 0;
}
async function checkRateLimit(db, accountId) {
  const count = await getRecentQuoteCount(db, accountId);
  if (count >= RATE_LIMIT_PER_MINUTE) {
    return { ok: false, retryAfter: 60 };
  }
  return { ok: true };
}
function shouldChargeForQuote(monthlyUsed) {
  return monthlyUsed >= FREE_TIER_MONTHLY;
}
async function getPlanStatus(db, accountId) {
  const used = await getMonthlyQuoteCount(db, accountId);
  const remaining = Math.max(0, FREE_TIER_MONTHLY - used);
  return {
    plan: "free",
    free_tier_limit: FREE_TIER_MONTHLY,
    free_tier_used: used,
    free_tier_remaining: remaining,
    on_payg: used >= FREE_TIER_MONTHLY,
    payg_cost_per_call: COST_PER_CALL,
    rate_limit_per_minute: RATE_LIMIT_PER_MINUTE,
    billing_period_start: monthStartMs()
  };
}
var FREE_TIER_MONTHLY, RATE_LIMIT_PER_MINUTE, COST_PER_CALL;
var init_plans = __esm({
  "src/plans.js"() {
    init_modules_watch_stub();
    FREE_TIER_MONTHLY = 500;
    RATE_LIMIT_PER_MINUTE = 40;
    COST_PER_CALL = 0.1;
    __name(monthStartMs, "monthStartMs");
    __name(getMonthlyQuoteCount, "getMonthlyQuoteCount");
    __name(getRecentQuoteCount, "getRecentQuoteCount");
    __name(checkRateLimit, "checkRateLimit");
    __name(shouldChargeForQuote, "shouldChargeForQuote");
    __name(getPlanStatus, "getPlanStatus");
  }
});

// src/db.js
function hasDatabase(env) {
  return Boolean(env.DB);
}
async function findAccountByEmail(db, email) {
  return db.prepare("SELECT * FROM accounts WHERE email = ?").bind(email.toLowerCase().trim()).first();
}
async function findApiKeyByHash(db, keyHash) {
  return db.prepare(
    `SELECT api_keys.*, accounts.org_name, accounts.email, accounts.wallet_balance
       FROM api_keys
       JOIN accounts ON accounts.id = api_keys.account_id
       WHERE api_keys.key_hash = ? AND api_keys.revoked_at IS NULL`
  ).bind(keyHash).first();
}
async function createAccountWithKey(db, { orgName, email, password }) {
  const accountId = generateId();
  const salt = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
  const passwordHash = await hashPassword(password, salt);
  const apiKey = generateApiKey();
  const keyHash = await hashApiKey(apiKey);
  const keyId = generateId();
  const now = Date.now();
  await db.batch([
    db.prepare(
      `INSERT INTO accounts (id, org_name, email, password_hash, password_salt, wallet_balance, created_at)
         VALUES (?, ?, ?, ?, ?, 0, ?)`
    ).bind(accountId, orgName.trim(), email.toLowerCase().trim(), passwordHash, salt, now),
    db.prepare(
      `INSERT INTO api_keys (id, account_id, key_hash, key_prefix, label, created_at)
         VALUES (?, ?, ?, ?, 'Default', ?)`
    ).bind(keyId, accountId, keyHash, maskApiKey(apiKey), now),
    db.prepare(
      `INSERT INTO rate_configs (account_id, rates_json, updated_at)
         VALUES (?, ?, ?)`
    ).bind(accountId, JSON.stringify(defaultRates), now)
  ]);
  await addWelcomeCredit(db, accountId);
  return {
    account: {
      id: accountId,
      org_name: orgName.trim(),
      email: email.toLowerCase().trim(),
      wallet_balance: 10
    },
    api_key: apiKey,
    key_prefix: maskApiKey(apiKey)
  };
}
async function loginAccount(db, { email, password }) {
  const account = await findAccountByEmail(db, email);
  if (!account) return null;
  const passwordHash = await hashPassword(password, account.password_salt);
  if (passwordHash !== account.password_hash) return null;
  const keyRow = await db.prepare(
    `SELECT id, key_prefix FROM api_keys
       WHERE account_id = ? AND revoked_at IS NULL
       ORDER BY created_at ASC LIMIT 1`
  ).bind(account.id).first();
  return {
    account: {
      id: account.id,
      org_name: account.org_name,
      email: account.email,
      wallet_balance: account.wallet_balance
    },
    key_prefix: keyRow?.key_prefix || null
  };
}
async function regenerateApiKey(db, { email, password }) {
  const account = await findAccountByEmail(db, email);
  if (!account) return null;
  const passwordHash = await hashPassword(password, account.password_salt);
  if (passwordHash !== account.password_hash) return null;
  const rotated = await rotateApiKey(db, account.id);
  return {
    account: {
      id: account.id,
      org_name: account.org_name,
      email: account.email,
      wallet_balance: account.wallet_balance
    },
    ...rotated
  };
}
async function rotateApiKey(db, accountId) {
  const apiKey = generateApiKey();
  const keyHash = await hashApiKey(apiKey);
  const keyId = generateId();
  const now = Date.now();
  await db.batch([
    db.prepare("UPDATE api_keys SET revoked_at = ? WHERE account_id = ? AND revoked_at IS NULL").bind(now, accountId),
    db.prepare(
      `INSERT INTO api_keys (id, account_id, key_hash, key_prefix, label, created_at)
         VALUES (?, ?, ?, ?, 'Default', ?)`
    ).bind(keyId, accountId, keyHash, maskApiKey(apiKey), now)
  ]);
  return { api_key: apiKey, key_prefix: maskApiKey(apiKey) };
}
async function getRates(db, accountId) {
  const row = await db.prepare("SELECT rates_json FROM rate_configs WHERE account_id = ?").bind(accountId).first();
  if (!row) return structuredClone(defaultRates);
  try {
    return JSON.parse(row.rates_json);
  } catch {
    return structuredClone(defaultRates);
  }
}
async function saveRates(db, accountId, rates) {
  const now = Date.now();
  await db.prepare(
    `INSERT INTO rate_configs (account_id, rates_json, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(account_id) DO UPDATE SET rates_json = excluded.rates_json, updated_at = excluded.updated_at`
  ).bind(accountId, JSON.stringify(rates), now).run();
}
async function logQuote(db, payload) {
  await db.prepare(
    `INSERT INTO quote_logs (
        id, account_id, api_key_id, vehicle,
        origin_lat, origin_lng, dest_lat, dest_lng,
        distance_km, duration_mins, price_ghs, latency_ms, success, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`
  ).bind(
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
  ).run();
}
async function getUsage(db, accountId) {
  const since = Date.now() - 7 * DAY_MS;
  const totals = await db.prepare(
    `SELECT
         COUNT(*) AS total_calls,
         AVG(latency_ms) AS avg_latency_ms
       FROM quote_logs
       WHERE account_id = ? AND created_at >= ? AND success = 1`
  ).bind(accountId, since).first();
  const dailyRows = await db.prepare(
    `SELECT
         date(created_at / 1000, 'unixepoch') AS day,
         COUNT(*) AS count
       FROM quote_logs
       WHERE account_id = ? AND created_at >= ? AND success = 1
       GROUP BY day
       ORDER BY day ASC`
  ).bind(accountId, since).all();
  const vehicleRows = await db.prepare(
    `SELECT vehicle, COUNT(*) AS count
       FROM quote_logs
       WHERE account_id = ? AND created_at >= ? AND success = 1
       GROUP BY vehicle`
  ).bind(accountId, since).all();
  const totalCalls = totals?.total_calls || 0;
  const avgLatency = Math.round(totals?.avg_latency_ms || 0);
  const totalSpend = await getSpendLast7Days(db, accountId, since);
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const chartMap = Object.fromEntries(
    (dailyRows.results || []).map((row) => [row.day, row.count])
  );
  const chart = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * DAY_MS);
    const key = d.toISOString().slice(0, 10);
    chart.push({
      label: labels[d.getDay() === 0 ? 6 : d.getDay() - 1] || labels[0],
      value: chartMap[key] || 0,
      date: key
    });
  }
  const vehicleCounts = vehicleRows.results || [];
  const vehicleTotal = vehicleCounts.reduce((sum, row) => sum + row.count, 0);
  const vehicleBreakdown = vehicleCounts.map((row) => ({
    vehicle: row.vehicle,
    count: row.count,
    pct: vehicleTotal ? Math.round(row.count / vehicleTotal * 100) : 0
  }));
  const plan = await getPlanStatus(db, accountId);
  return {
    total_calls: totalCalls,
    total_spend: totalSpend,
    avg_latency_ms: avgLatency,
    success_rate: totalCalls > 0 ? 100 : 100,
    chart,
    vehicle_breakdown: vehicleBreakdown,
    cost_per_call: COST_PER_CALL2,
    plan
  };
}
var COST_PER_CALL2, DAY_MS;
var init_db = __esm({
  "src/db.js"() {
    init_modules_watch_stub();
    init_pricing();
    init_crypto();
    init_wallet();
    init_plans();
    COST_PER_CALL2 = 0.1;
    DAY_MS = 864e5;
    __name(hasDatabase, "hasDatabase");
    __name(findAccountByEmail, "findAccountByEmail");
    __name(findApiKeyByHash, "findApiKeyByHash");
    __name(createAccountWithKey, "createAccountWithKey");
    __name(loginAccount, "loginAccount");
    __name(regenerateApiKey, "regenerateApiKey");
    __name(rotateApiKey, "rotateApiKey");
    __name(getRates, "getRates");
    __name(saveRates, "saveRates");
    __name(logQuote, "logQuote");
    __name(getUsage, "getUsage");
  }
});

// src/auth.js
function extractBearerToken(request) {
  const auth = request.headers.get("Authorization") || "";
  return auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
}
async function authenticateRequest(request, env) {
  const token = extractBearerToken(request);
  if (!token) {
    return {
      ok: false,
      status: 401,
      code: "UNAUTHORIZED",
      message: "Missing or invalid API key."
    };
  }
  if (hasDatabase(env)) {
    const keyHash = await hashApiKey(token);
    const row = await findApiKeyByHash(env.DB, keyHash);
    if (row) {
      return {
        ok: true,
        token,
        account: {
          id: row.account_id,
          org_name: row.org_name,
          email: row.email,
          wallet_balance: row.wallet_balance
        },
        apiKeyId: row.id
      };
    }
  }
  const legacyKeys = (env.ANY3MI_API_KEYS || "").split(",").map((k) => k.trim()).filter(Boolean);
  if (legacyKeys.includes(token)) {
    return {
      ok: true,
      token,
      account: null,
      apiKeyId: null,
      legacy: true
    };
  }
  if (!hasDatabase(env) && legacyKeys.length === 0) {
    return { ok: true, token: null, account: null, apiKeyId: null, legacy: true };
  }
  return {
    ok: false,
    status: 401,
    code: "UNAUTHORIZED",
    message: "Missing or invalid API key."
  };
}
var init_auth = __esm({
  "src/auth.js"() {
    init_modules_watch_stub();
    init_crypto();
    init_db();
    __name(extractBearerToken, "extractBearerToken");
    __name(authenticateRequest, "authenticateRequest");
  }
});

// src/email.js
function isEmailConfigured(env) {
  return Boolean(env.RESEND_API_KEY?.trim());
}
function getEmailFrom(env) {
  return env.EMAIL_FROM?.trim() || "ANY3MI <onboarding@resend.dev>";
}
function getAppUrl(env) {
  const url = env.APP_URL?.trim() || "https://cur-sur-demo.vercel.app";
  return url.replace(/\/$/, "");
}
function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function layout({ title, bodyHtml, appUrl }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#fafafa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#09090b;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#111114;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 8px;">
              <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#d4ff00;">ANY3MI</p>
              <h1 style="margin:12px 0 0;font-size:22px;line-height:1.3;color:#fafafa;">${escapeHtml(title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 24px;font-size:15px;line-height:1.6;color:#a1a1aa;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;">
              <a href="${escapeHtml(appUrl)}/dashboard/overview" style="display:inline-block;background:#d4ff00;color:#0a0a0c;text-decoration:none;font-weight:600;font-size:14px;padding:12px 18px;border-radius:10px;">Open dashboard</a>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px;border-top:1px solid rgba(255,255,255,0.07);font-size:12px;line-height:1.5;color:#71717a;">
              Usammi TECH DEPT \xB7 Ghana routing &amp; pricing API<br />
              <a href="${escapeHtml(appUrl)}" style="color:#d4ff00;text-decoration:none;">${escapeHtml(appUrl.replace(/^https?:\/\//, ""))}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
function buildWelcomeEmail({ orgName, appUrl }) {
  const title = `Welcome to ANY3MI, ${orgName}`;
  const bodyHtml = `
    <p style="margin:0 0 16px;">Your developer account is ready. We've added <strong style="color:#fafafa;">GH\u20B5 10.00</strong> welcome credit to your wallet.</p>
    <p style="margin:0 0 16px;">Copy your API key from the portal \u2014 it is only shown once at signup or after rotation. Use it as <code style="background:#141418;padding:2px 6px;border-radius:4px;color:#d4ff00;">Authorization: Bearer \u2026</code> on <code style="background:#141418;padding:2px 6px;border-radius:4px;color:#d4ff00;">POST /v1/quote</code>.</p>
    <p style="margin:0;">You get <strong style="color:#fafafa;">500 free quote calls per month</strong>, then pay-as-you-go at GH\u20B5 0.10 per call.</p>
  `;
  return {
    subject: "Welcome to ANY3MI \u2014 your API key is ready",
    html: layout({ title, bodyHtml, appUrl })
  };
}
function buildKeyRotatedEmail({ orgName, keyPrefix, appUrl }) {
  const title = "Your ANY3MI API key was rotated";
  const bodyHtml = `
    <p style="margin:0 0 16px;">A new API key was issued for <strong style="color:#fafafa;">${escapeHtml(orgName)}</strong>.</p>
    <p style="margin:0 0 16px;">Active key prefix: <code style="background:#141418;padding:2px 6px;border-radius:4px;color:#d4ff00;">${escapeHtml(keyPrefix || "a3_live_\u2022\u2022\u2022\u2022")}</code></p>
    <p style="margin:0 0 16px;">Previous keys are revoked. Update any servers or scripts still using the old secret.</p>
    <p style="margin:0;color:#f87171;">If you didn't request this, rotate again immediately and review your account activity.</p>
  `;
  return {
    subject: "ANY3MI API key rotated",
    html: layout({ title, bodyHtml, appUrl })
  };
}
function buildWalletTopUpEmail({ orgName, amountGhs, balanceGhs, appUrl }) {
  const title = `Wallet topped up \u2014 GH\u20B5 ${amountGhs.toFixed(2)}`;
  const bodyHtml = `
    <p style="margin:0 0 16px;"><strong style="color:#fafafa;">${escapeHtml(orgName)}</strong> \u2014 your ANY3MI wallet was credited.</p>
    <p style="margin:0 0 8px;">Amount added: <strong style="color:#4ade80;">GH\u20B5 ${amountGhs.toFixed(2)}</strong></p>
    <p style="margin:0;">New balance: <strong style="color:#fafafa;">GH\u20B5 ${balanceGhs.toFixed(2)}</strong></p>
  `;
  return {
    subject: `ANY3MI wallet top-up \u2014 GH\u20B5 ${amountGhs.toFixed(2)}`,
    html: layout({ title, bodyHtml, appUrl })
  };
}
async function sendEmail(env, { to, subject, html, idempotencyKey }) {
  if (!isEmailConfigured(env)) {
    return { ok: false, skipped: true, reason: "RESEND_API_KEY not configured" };
  }
  const from = getEmailFrom(env);
  const headers = {
    Authorization: `Bearer ${env.RESEND_API_KEY.trim()}`,
    "Content-Type": "application/json",
    "User-Agent": USER_AGENT
  };
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey.slice(0, 256);
  }
  const response = await fetch(RESEND_API, {
    method: "POST",
    headers,
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html
    })
  });
  const body = await response.text();
  if (!response.ok) {
    let message = body || `Resend error (${response.status})`;
    try {
      const parsed = JSON.parse(body);
      message = parsed?.message || parsed?.error?.message || message;
    } catch {
    }
    return { ok: false, skipped: false, status: response.status, message };
  }
  let id = null;
  try {
    id = JSON.parse(body)?.id ?? null;
  } catch {
  }
  return { ok: true, id };
}
async function sendWelcomeEmail(env, { email, orgName, accountId }) {
  const appUrl = getAppUrl(env);
  const { subject, html } = buildWelcomeEmail({ orgName, appUrl });
  return sendEmail(env, {
    to: email,
    subject,
    html,
    idempotencyKey: `welcome-${accountId}`
  });
}
async function sendKeyRotatedEmail(env, { email, orgName, keyPrefix, accountId, action }) {
  const appUrl = getAppUrl(env);
  const { subject, html } = buildKeyRotatedEmail({ orgName, keyPrefix, appUrl });
  return sendEmail(env, {
    to: email,
    subject,
    html,
    idempotencyKey: `key-${action}-${accountId}-${Date.now()}`
  });
}
async function sendWalletTopUpEmail(env, { email, orgName, amountGhs, balanceGhs, accountId, txId }) {
  const appUrl = getAppUrl(env);
  const { subject, html } = buildWalletTopUpEmail({ orgName, amountGhs, balanceGhs, appUrl });
  return sendEmail(env, {
    to: email,
    subject,
    html,
    idempotencyKey: txId ? `topup-${txId}` : `topup-${accountId}-${amountGhs}`
  });
}
var RESEND_API, USER_AGENT;
var init_email = __esm({
  "src/email.js"() {
    init_modules_watch_stub();
    RESEND_API = "https://api.resend.com/emails";
    USER_AGENT = "any3mi-api/4.1.0";
    __name(isEmailConfigured, "isEmailConfigured");
    __name(getEmailFrom, "getEmailFrom");
    __name(getAppUrl, "getAppUrl");
    __name(escapeHtml, "escapeHtml");
    __name(layout, "layout");
    __name(buildWelcomeEmail, "buildWelcomeEmail");
    __name(buildKeyRotatedEmail, "buildKeyRotatedEmail");
    __name(buildWalletTopUpEmail, "buildWalletTopUpEmail");
    __name(sendEmail, "sendEmail");
    __name(sendWelcomeEmail, "sendWelcomeEmail");
    __name(sendKeyRotatedEmail, "sendKeyRotatedEmail");
    __name(sendWalletTopUpEmail, "sendWalletTopUpEmail");
  }
});

// src/http.js
function corsHeaders(request, env) {
  const allowed = (env.ALLOWED_ORIGINS || "*").split(",").map((s) => s.trim());
  const origin = request.headers.get("Origin") || "";
  const allowOrigin = allowed.includes("*") || allowed.includes(origin) ? origin || "*" : allowed[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400"
  };
}
function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders
    }
  });
}
function errorResponse(code, name, message, status, extraHeaders = {}) {
  return json(
    {
      status: "error",
      error: { code: status, name, message }
    },
    status,
    extraHeaders
  );
}
function rateLimitResponse(retryAfter, extraHeaders = {}) {
  return errorResponse(
    "RATE_LIMITED",
    "RATE_LIMITED",
    `Exceeded plan rate limit. Retry after ${retryAfter} seconds.`,
    429,
    { "Retry-After": String(retryAfter), ...extraHeaders }
  );
}
var init_http = __esm({
  "src/http.js"() {
    init_modules_watch_stub();
    __name(corsHeaders, "corsHeaders");
    __name(json, "json");
    __name(errorResponse, "errorResponse");
    __name(rateLimitResponse, "rateLimitResponse");
  }
});

// src/handlers/account.js
var account_exports = {};
__export(account_exports, {
  handleGetRates: () => handleGetRates,
  handleLogin: () => handleLogin,
  handleMe: () => handleMe,
  handlePutRates: () => handlePutRates,
  handleRegenerateKey: () => handleRegenerateKey,
  handleRegister: () => handleRegister,
  handleUsage: () => handleUsage
});
function dbRequired(request, env) {
  const headers = corsHeaders(request, env);
  if (!hasDatabase(env)) {
    return {
      ok: false,
      response: errorResponse(
        "SERVICE_UNAVAILABLE",
        "SERVICE_UNAVAILABLE",
        "Database not configured.",
        503,
        headers
      )
    };
  }
  return { ok: true, headers };
}
async function dispatchEmail(label, sendFn) {
  try {
    const result = await sendFn();
    if (!result.ok && !result.skipped) {
      console.error(`${label} email failed:`, result.message);
    }
    return result.ok;
  } catch (err) {
    console.error(`${label} email error:`, err);
    return false;
  }
}
async function handleRegister(request, env) {
  const check = dbRequired(request, env);
  if (!check.ok) return check.response;
  const headers = check.headers;
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_REQUEST", "INVALID_REQUEST", "Malformed JSON.", 400, headers);
  }
  const { org_name, email, password } = body || {};
  if (!org_name?.trim() || !email?.trim() || !password || password.length < 8) {
    return errorResponse(
      "INVALID_REQUEST",
      "INVALID_REQUEST",
      "org_name, email, and password (min 8 chars) are required.",
      400,
      headers
    );
  }
  try {
    const result = await createAccountWithKey(env.DB, {
      orgName: org_name,
      email,
      password
    });
    const email_sent = await dispatchEmail(
      "Welcome",
      () => sendWelcomeEmail(env, {
        email: result.account.email,
        orgName: result.account.org_name,
        accountId: result.account.id
      })
    );
    return json({ status: "success", ...result, email_sent }, 201, headers);
  } catch (err) {
    if (String(err).includes("UNIQUE")) {
      return errorResponse(
        "EMAIL_EXISTS",
        "EMAIL_EXISTS",
        "An account with this email already exists.",
        409,
        headers
      );
    }
    throw err;
  }
}
async function handleLogin(request, env) {
  const check = dbRequired(request, env);
  if (!check.ok) return check.response;
  const headers = check.headers;
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_REQUEST", "INVALID_REQUEST", "Malformed JSON.", 400, headers);
  }
  const result = await loginAccount(env.DB, body || {});
  if (!result) {
    return errorResponse(
      "UNAUTHORIZED",
      "UNAUTHORIZED",
      "Invalid email or password.",
      401,
      headers
    );
  }
  return json({ status: "success", ...result }, 200, headers);
}
async function handleRegenerateKey(request, env) {
  const check = dbRequired(request, env);
  if (!check.ok) return check.response;
  const headers = check.headers;
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_REQUEST", "INVALID_REQUEST", "Malformed JSON.", 400, headers);
  }
  const result = await regenerateApiKey(env.DB, body || {});
  if (!result) {
    return errorResponse(
      "UNAUTHORIZED",
      "UNAUTHORIZED",
      "Invalid email or password.",
      401,
      headers
    );
  }
  const email_sent = await dispatchEmail(
    "Key rotated",
    () => sendKeyRotatedEmail(env, {
      email: result.account.email,
      orgName: result.account.org_name,
      keyPrefix: result.key_prefix,
      accountId: result.account.id,
      action: "regenerate"
    })
  );
  return json({ status: "success", ...result, email_sent }, 200, headers);
}
async function handleMe(request, env) {
  const headers = corsHeaders(request, env);
  const auth = await authenticateRequest(request, env);
  if (!auth.ok) {
    return errorResponse(auth.code, auth.code, auth.message, auth.status, headers);
  }
  if (!auth.account) {
    return json(
      {
        status: "success",
        account: { org_name: "Legacy key", email: null },
        key_prefix: auth.token ? `${auth.token.slice(0, 12)}\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022${auth.token.slice(-4)}` : null,
        legacy: true
      },
      200,
      headers
    );
  }
  const keyPrefix = auth.token ? `${auth.token.slice(0, 12)}\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022${auth.token.slice(-4)}` : null;
  return json(
    {
      status: "success",
      account: {
        org_name: auth.account.org_name,
        email: auth.account.email,
        wallet_balance: auth.account.wallet_balance
      },
      key_prefix: keyPrefix
    },
    200,
    headers
  );
}
async function handleUsage(request, env) {
  const headers = corsHeaders(request, env);
  const auth = await authenticateRequest(request, env);
  if (!auth.ok) {
    return errorResponse(auth.code, auth.code, auth.message, auth.status, headers);
  }
  if (!auth.account) {
    return json(
      {
        status: "success",
        total_calls: 0,
        total_spend: 0,
        avg_latency_ms: 0,
        success_rate: 100,
        chart: [],
        vehicle_breakdown: [],
        cost_per_call: 0.1,
        legacy: true
      },
      200,
      headers
    );
  }
  const usage = await getUsage(env.DB, auth.account.id);
  return json({ status: "success", ...usage }, 200, headers);
}
async function handleGetRates(request, env) {
  const headers = corsHeaders(request, env);
  const auth = await authenticateRequest(request, env);
  if (!auth.ok) {
    return errorResponse(auth.code, auth.code, auth.message, auth.status, headers);
  }
  if (!auth.account) {
    const { defaultRates: defaultRates2 } = await Promise.resolve().then(() => (init_pricing(), pricing_exports));
    return json({ status: "success", rates: defaultRates2, legacy: true }, 200, headers);
  }
  const rates = await getRates(env.DB, auth.account.id);
  return json({ status: "success", rates }, 200, headers);
}
async function handlePutRates(request, env) {
  const headers = corsHeaders(request, env);
  const auth = await authenticateRequest(request, env);
  if (!auth.ok) {
    return errorResponse(auth.code, auth.code, auth.message, auth.status, headers);
  }
  if (!auth.account) {
    return errorResponse(
      "UNAUTHORIZED",
      "UNAUTHORIZED",
      "Account required to save rates.",
      401,
      headers
    );
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_REQUEST", "INVALID_REQUEST", "Malformed JSON.", 400, headers);
  }
  if (!body?.rates || typeof body.rates !== "object") {
    return errorResponse(
      "INVALID_REQUEST",
      "INVALID_REQUEST",
      "rates object is required.",
      400,
      headers
    );
  }
  await saveRates(env.DB, auth.account.id, body.rates);
  return json({ status: "success", rates: body.rates }, 200, headers);
}
var init_account = __esm({
  "src/handlers/account.js"() {
    init_modules_watch_stub();
    init_db();
    init_auth();
    init_email();
    init_http();
    __name(dbRequired, "dbRequired");
    __name(dispatchEmail, "dispatchEmail");
    __name(handleRegister, "handleRegister");
    __name(handleLogin, "handleLogin");
    __name(handleRegenerateKey, "handleRegenerateKey");
    __name(handleMe, "handleMe");
    __name(handleUsage, "handleUsage");
    __name(handleGetRates, "handleGetRates");
    __name(handlePutRates, "handlePutRates");
  }
});

// src/handlers/wallet.js
var wallet_exports = {};
__export(wallet_exports, {
  handleGetWallet: () => handleGetWallet,
  handleTopUp: () => handleTopUp
});
function dbRequired2(request, env) {
  const headers = corsHeaders(request, env);
  if (!hasDatabase(env)) {
    return {
      ok: false,
      response: errorResponse(
        "SERVICE_UNAVAILABLE",
        "SERVICE_UNAVAILABLE",
        "Database not configured.",
        503,
        headers
      )
    };
  }
  return { ok: true, headers };
}
async function requireAuth(request, env) {
  const headers = corsHeaders(request, env);
  const auth = await authenticateRequest(request, env);
  if (!auth.ok) {
    return {
      ok: false,
      response: errorResponse(auth.code, auth.code, auth.message, auth.status, headers)
    };
  }
  if (!auth.account) {
    return {
      ok: false,
      response: errorResponse(
        "UNAUTHORIZED",
        "UNAUTHORIZED",
        "Account required for wallet access.",
        401,
        headers
      )
    };
  }
  return { ok: true, headers, auth };
}
async function handleGetWallet(request, env) {
  const dbCheck = dbRequired2(request, env);
  if (!dbCheck.ok) return dbCheck.response;
  const authResult = await requireAuth(request, env);
  if (!authResult.ok) return authResult.response;
  const wallet = await getWallet(env.DB, authResult.auth.account.id);
  return json({ status: "success", ...wallet }, 200, authResult.headers);
}
async function handleTopUp(request, env) {
  const dbCheck = dbRequired2(request, env);
  if (!dbCheck.ok) return dbCheck.response;
  const authResult = await requireAuth(request, env);
  if (!authResult.ok) return authResult.response;
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse(
      "INVALID_REQUEST",
      "INVALID_REQUEST",
      "Malformed JSON.",
      400,
      authResult.headers
    );
  }
  const result = await processTopUp(env.DB, authResult.auth.account.id, body || {});
  if (!result.ok) {
    return errorResponse(
      "INVALID_REQUEST",
      "INVALID_REQUEST",
      result.message,
      400,
      authResult.headers
    );
  }
  const account = authResult.auth.account;
  let email_sent = false;
  try {
    const emailResult = await sendWalletTopUpEmail(env, {
      email: account.email,
      orgName: account.org_name,
      amountGhs: result.amount,
      balanceGhs: result.balance,
      accountId: account.id,
      txId: result.transaction_id
    });
    email_sent = emailResult.ok;
    if (!emailResult.ok && !emailResult.skipped) {
      console.error("Top-up email failed:", emailResult.message);
    }
  } catch (err) {
    console.error("Top-up email error:", err);
  }
  return json(
    {
      status: "success",
      balance: result.balance,
      amount: result.amount,
      provider: result.provider,
      phone: result.phone,
      reference: result.reference,
      transaction_id: result.transaction_id,
      mode: result.mode,
      email_sent
    },
    200,
    authResult.headers
  );
}
var init_wallet2 = __esm({
  "src/handlers/wallet.js"() {
    init_modules_watch_stub();
    init_auth();
    init_db();
    init_email();
    init_http();
    init_wallet();
    __name(dbRequired2, "dbRequired");
    __name(requireAuth, "requireAuth");
    __name(handleGetWallet, "handleGetWallet");
    __name(handleTopUp, "handleTopUp");
  }
});

// src/handlers/plan.js
var plan_exports = {};
__export(plan_exports, {
  handleGetPlan: () => handleGetPlan,
  handleRotateKey: () => handleRotateKey
});
function dbRequired3(request, env) {
  const headers = corsHeaders(request, env);
  if (!hasDatabase(env)) {
    return {
      ok: false,
      response: errorResponse(
        "SERVICE_UNAVAILABLE",
        "SERVICE_UNAVAILABLE",
        "Database not configured.",
        503,
        headers
      )
    };
  }
  return { ok: true, headers };
}
async function requireAuth2(request, env) {
  const headers = corsHeaders(request, env);
  const auth = await authenticateRequest(request, env);
  if (!auth.ok) {
    return {
      ok: false,
      response: errorResponse(auth.code, auth.code, auth.message, auth.status, headers)
    };
  }
  if (!auth.account) {
    return {
      ok: false,
      response: errorResponse(
        "UNAUTHORIZED",
        "UNAUTHORIZED",
        "Account required.",
        401,
        headers
      )
    };
  }
  return { ok: true, headers, auth };
}
async function handleGetPlan(request, env) {
  const dbCheck = dbRequired3(request, env);
  if (!dbCheck.ok) return dbCheck.response;
  const authResult = await requireAuth2(request, env);
  if (!authResult.ok) return authResult.response;
  const plan = await getPlanStatus(env.DB, authResult.auth.account.id);
  return json({ status: "success", ...plan }, 200, authResult.headers);
}
async function handleRotateKey(request, env) {
  const dbCheck = dbRequired3(request, env);
  if (!dbCheck.ok) return dbCheck.response;
  const authResult = await requireAuth2(request, env);
  if (!authResult.ok) return authResult.response;
  const rotated = await rotateApiKey(env.DB, authResult.auth.account.id);
  const account = authResult.auth.account;
  let email_sent = false;
  try {
    const emailResult = await sendKeyRotatedEmail(env, {
      email: account.email,
      orgName: account.org_name,
      keyPrefix: rotated.key_prefix,
      accountId: account.id,
      action: "rotate"
    });
    email_sent = emailResult.ok;
    if (!emailResult.ok && !emailResult.skipped) {
      console.error("Key rotate email failed:", emailResult.message);
    }
  } catch (err) {
    console.error("Key rotate email error:", err);
  }
  return json(
    {
      status: "success",
      api_key: rotated.api_key,
      key_prefix: rotated.key_prefix,
      message: "Previous API keys have been revoked.",
      email_sent
    },
    200,
    authResult.headers
  );
}
var init_plan = __esm({
  "src/handlers/plan.js"() {
    init_modules_watch_stub();
    init_auth();
    init_db();
    init_email();
    init_http();
    init_plans();
    __name(dbRequired3, "dbRequired");
    __name(requireAuth2, "requireAuth");
    __name(handleGetPlan, "handleGetPlan");
    __name(handleRotateKey, "handleRotateKey");
  }
});

// .wrangler/tmp/bundle-hobTWD/middleware-loader.entry.ts
init_modules_watch_stub();

// .wrangler/tmp/bundle-hobTWD/middleware-insertion-facade.js
init_modules_watch_stub();

// src/index.js
init_modules_watch_stub();
init_pricing();
init_auth();
init_db();
init_email();
init_http();
init_plans();

// src/routing.js
init_modules_watch_stub();
var ORS_PROFILE = {
  bicycle: "cycling-regular",
  motorbike: "driving-car",
  car: "driving-car"
};
var RoutingError = class extends Error {
  static {
    __name(this, "RoutingError");
  }
  constructor(message, status = 500) {
    super(message);
    this.name = "RoutingError";
    this.status = status;
    this.code = status === 429 ? "RATE_LIMITED" : "ROUTING_FAILED";
  }
};
async function fetchRouteMetrics(env, origin, destination, vehicle) {
  const apiKey = env.ORS_API_KEY;
  if (!apiKey) {
    throw new RoutingError("Routing service not configured", 500);
  }
  const profile = ORS_PROFILE[vehicle];
  const url = `https://api.openrouteservice.org/v2/directions/${profile}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      coordinates: [
        [origin.lng, origin.lat],
        [destination.lng, destination.lat]
      ]
    })
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new RoutingError(
      detail || `Routing provider returned ${response.status}`,
      response.status === 429 ? 429 : 500
    );
  }
  const data = await response.json();
  const summary = data?.routes?.[0]?.summary;
  if (!summary) {
    throw new RoutingError("No route found between coordinates");
  }
  return {
    distanceKm: summary.distance / 1e3,
    durationMins: summary.duration / 60
  };
}
__name(fetchRouteMetrics, "fetchRouteMetrics");

// src/locations.js
init_modules_watch_stub();

// src/geocoding.js
init_modules_watch_stub();

// src/validate.js
init_modules_watch_stub();
var GHANA = {
  latMin: 4.5,
  latMax: 11.5,
  lngMin: -3.5,
  lngMax: 1.5
};
var SUPPORTED_VEHICLES = /* @__PURE__ */ new Set(["bicycle", "motorbike", "car"]);
var MIN_ADDRESS_LENGTH = 3;
function isInGhana(lat, lng) {
  return lat >= GHANA.latMin && lat <= GHANA.latMax && lng >= GHANA.lngMin && lng <= GHANA.lngMax;
}
__name(isInGhana, "isInGhana");
function parseLocationInput(input) {
  if (typeof input === "string") {
    const address2 = input.trim();
    if (address2.length < MIN_ADDRESS_LENGTH) return { kind: "invalid" };
    return { kind: "address", address: address2 };
  }
  if (!input || typeof input !== "object") {
    return { kind: "invalid" };
  }
  const address = typeof input.address === "string" ? input.address.trim() : "";
  const hasCoords = typeof input.lat === "number" && typeof input.lng === "number" && !Number.isNaN(input.lat) && !Number.isNaN(input.lng);
  if (address && hasCoords) {
    return {
      kind: "coordinates",
      lat: input.lat,
      lng: input.lng,
      label: typeof input.label === "string" ? input.label.trim() : void 0,
      address
    };
  }
  if (address) {
    if (address.length < MIN_ADDRESS_LENGTH) return { kind: "invalid" };
    return { kind: "address", address };
  }
  if (hasCoords) {
    return {
      kind: "coordinates",
      lat: input.lat,
      lng: input.lng,
      label: typeof input.label === "string" ? input.label.trim() : void 0
    };
  }
  return { kind: "invalid" };
}
__name(parseLocationInput, "parseLocationInput");
function validateQuoteRequest(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, status: 400, code: "INVALID_REQUEST", message: "JSON body required." };
  }
  const { vehicle } = body;
  if (!SUPPORTED_VEHICLES.has(vehicle)) {
    return {
      ok: false,
      status: 422,
      code: "UNSUPPORTED_VEHICLE",
      message: "Vehicle type not recognized."
    };
  }
  const origin = parseLocationInput(body.origin);
  const destination = parseLocationInput(body.destination);
  if (origin.kind === "invalid") {
    return {
      ok: false,
      status: 400,
      code: "INVALID_LOCATION",
      message: "origin must include { lat, lng } coordinates or an address string (min 3 characters)."
    };
  }
  if (destination.kind === "invalid") {
    return {
      ok: false,
      status: 400,
      code: "INVALID_LOCATION",
      message: "destination must include { lat, lng } coordinates or an address string (min 3 characters)."
    };
  }
  if (origin.kind === "coordinates" && !isInGhana(origin.lat, origin.lng)) {
    return {
      ok: false,
      status: 400,
      code: "INVALID_COORDINATES",
      message: "origin coordinates are outside supported Ghana bounds."
    };
  }
  if (destination.kind === "coordinates" && !isInGhana(destination.lat, destination.lng)) {
    return {
      ok: false,
      status: 400,
      code: "INVALID_COORDINATES",
      message: "destination coordinates are outside supported Ghana bounds."
    };
  }
  return {
    ok: true,
    value: { origin, destination, vehicle }
  };
}
__name(validateQuoteRequest, "validateQuoteRequest");
function formatPlaceLabel(lat, lng) {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(3)}\xB0${latDir}, ${Math.abs(lng).toFixed(3)}\xB0${lngDir}`;
}
__name(formatPlaceLabel, "formatPlaceLabel");

// src/geocoding.js
var GeocodingError = class extends Error {
  static {
    __name(this, "GeocodingError");
  }
  constructor(message, status = 422, code = "GEOCODING_FAILED") {
    super(message);
    this.name = "GeocodingError";
    this.status = status;
    this.code = code;
  }
};
var FOCUS = { lat: 5.6037, lng: -0.187 };
async function geocodeAddress(env, query) {
  const apiKey = env.ORS_API_KEY;
  if (!apiKey) {
    throw new GeocodingError("Geocoding service not configured", 500);
  }
  const text = String(query).trim();
  const params = new URLSearchParams({
    text,
    size: "1",
    "boundary.country": "GHA",
    "focus.point.lat": String(FOCUS.lat),
    "focus.point.lon": String(FOCUS.lng)
  });
  const response = await fetch(
    `https://api.openrouteservice.org/geocode/search?${params}`,
    {
      headers: {
        Authorization: apiKey,
        Accept: "application/json"
      }
    }
  );
  if (!response.ok) {
    const detail = await response.text();
    throw new GeocodingError(
      detail || `Geocoding provider returned ${response.status}`,
      response.status === 429 ? 429 : 422
    );
  }
  const data = await response.json();
  const feature = data?.features?.[0];
  if (!feature?.geometry?.coordinates) {
    throw new GeocodingError(
      `Could not find a location in Ghana for "${text}". Try a more specific address.`,
      422
    );
  }
  const [lng, lat] = feature.geometry.coordinates;
  if (!isInGhana(lat, lng)) {
    throw new GeocodingError(
      `Resolved location for "${text}" is outside supported Ghana bounds.`,
      422,
      "INVALID_COORDINATES"
    );
  }
  const props = feature.properties || {};
  const label = props.label || props.name || text;
  return {
    lat,
    lng,
    label,
    address: text
  };
}
__name(geocodeAddress, "geocodeAddress");

// src/locations.js
async function resolveLocation(env, parsed, role) {
  if (parsed.kind === "coordinates") {
    if (!isInGhana(parsed.lat, parsed.lng)) {
      throw new GeocodingError(
        `${role} coordinates are outside supported Ghana bounds.`,
        400,
        "INVALID_COORDINATES"
      );
    }
    return {
      lat: parsed.lat,
      lng: parsed.lng,
      label: parsed.label || formatPlaceLabel(parsed.lat, parsed.lng),
      address: parsed.address || null
    };
  }
  if (parsed.kind === "address") {
    return geocodeAddress(env, parsed.address);
  }
  throw new GeocodingError(`Invalid ${role} location.`, 400, "INVALID_REQUEST");
}
__name(resolveLocation, "resolveLocation");
async function resolveQuoteLocations(env, { origin, destination }) {
  const [resolvedOrigin, resolvedDestination] = await Promise.all([
    resolveLocation(env, origin, "origin"),
    resolveLocation(env, destination, "destination")
  ]);
  return {
    origin: resolvedOrigin,
    destination: resolvedDestination
  };
}
__name(resolveQuoteLocations, "resolveQuoteLocations");
function formatRoutePoint(point) {
  const payload = {
    label: point.label,
    lat: Math.round(point.lat * 1e6) / 1e6,
    lng: Math.round(point.lng * 1e6) / 1e6
  };
  if (point.address) payload.address = point.address;
  return payload;
}
__name(formatRoutePoint, "formatRoutePoint");

// src/index.js
init_wallet();
async function handleHealth(request, env) {
  const headers = corsHeaders(request, env);
  return json(
    {
      status: "ok",
      service: "any3mi-api",
      version: "5.0.0",
      routing: env.ORS_API_KEY ? "openrouteservice" : "unconfigured",
      geocoding: env.ORS_API_KEY ? "openrouteservice" : "unconfigured",
      database: hasDatabase(env) ? "connected" : "unconfigured",
      email: isEmailConfigured(env) ? "resend" : "unconfigured"
    },
    200,
    headers
  );
}
__name(handleHealth, "handleHealth");
async function handleQuote(request, env) {
  const headers = corsHeaders(request, env);
  const started = Date.now();
  const auth = await authenticateRequest(request, env);
  if (!auth.ok) {
    return errorResponse(auth.code, auth.code, auth.message, auth.status, headers);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse(
      "INVALID_REQUEST",
      "INVALID_REQUEST",
      "Malformed JSON body.",
      400,
      headers
    );
  }
  const validation = validateQuoteRequest(body);
  if (!validation.ok) {
    return errorResponse(
      validation.code,
      validation.code,
      validation.message,
      validation.status,
      headers
    );
  }
  const { origin, destination, vehicle } = validation.value;
  let resolved;
  try {
    resolved = await resolveQuoteLocations(env, { origin, destination });
  } catch (err) {
    if (err instanceof GeocodingError) {
      return errorResponse(err.code, err.code, err.message, err.status, headers);
    }
    throw err;
  }
  if (auth.account && hasDatabase(env)) {
    const rateCheck = await checkRateLimit(env.DB, auth.account.id);
    if (!rateCheck.ok) {
      return rateLimitResponse(rateCheck.retryAfter, headers);
    }
  }
  let metrics;
  try {
    metrics = await fetchRouteMetrics(
      env,
      resolved.origin,
      resolved.destination,
      vehicle
    );
  } catch (err) {
    if (err instanceof RoutingError) {
      return errorResponse(
        err.code,
        err.code,
        err.message,
        err.status,
        headers
      );
    }
    throw err;
  }
  const rates = auth.account && hasDatabase(env) ? await getRates(env.DB, auth.account.id) : defaultRates;
  const quote = calculateQuote(
    rates,
    vehicle,
    metrics.distanceKm,
    metrics.durationMins
  );
  if (!quote) {
    return errorResponse(
      "UNSUPPORTED_VEHICLE",
      "UNSUPPORTED_VEHICLE",
      "Vehicle type not recognized.",
      422,
      headers
    );
  }
  const latencyMs = Date.now() - started;
  let billed = false;
  if (auth.account && hasDatabase(env)) {
    const monthlyUsed = await getMonthlyQuoteCount(env.DB, auth.account.id);
    const charge = shouldChargeForQuote(monthlyUsed);
    if (charge) {
      const account = await env.DB.prepare(
        "SELECT wallet_balance FROM accounts WHERE id = ?"
      ).bind(auth.account.id).first();
      if ((account?.wallet_balance || 0) < COST_PER_CALL) {
        return errorResponse(
          "INSUFFICIENT_BALANCE",
          "INSUFFICIENT_BALANCE",
          `Free tier exhausted (${monthlyUsed} calls this month). Top up your wallet to continue.`,
          402,
          headers
        );
      }
      const debit = await debitForApiCall(env.DB, auth.account.id, COST_PER_CALL);
      if (!debit.ok) {
        return errorResponse(
          "INSUFFICIENT_BALANCE",
          "INSUFFICIENT_BALANCE",
          "Wallet balance too low. Top up under Billing to continue.",
          402,
          headers
        );
      }
      billed = true;
    }
    await logQuote(env.DB, {
      accountId: auth.account.id,
      apiKeyId: auth.apiKeyId,
      vehicle,
      origin: resolved.origin,
      destination: resolved.destination,
      distanceKm: quote.distance_km,
      durationMins: quote.duration_mins,
      priceGhs: quote.price_ghs,
      latencyMs
    });
  }
  return json(
    {
      status: "success",
      route: {
        origin: formatRoutePoint(resolved.origin),
        destination: formatRoutePoint(resolved.destination)
      },
      billing: billed ? { mode: "payg", cost_ghs: COST_PER_CALL } : { mode: "free_tier", cost_ghs: 0 },
      ...quote
    },
    200,
    headers
  );
}
__name(handleQuote, "handleQuote");
var src_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = corsHeaders(request, env);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }
    try {
      const { handleRegister: handleRegister2, handleLogin: handleLogin2, handleRegenerateKey: handleRegenerateKey2, handleMe: handleMe2, handleUsage: handleUsage2, handleGetRates: handleGetRates2, handlePutRates: handlePutRates2 } = await Promise.resolve().then(() => (init_account(), account_exports));
      const { handleGetWallet: handleGetWallet2, handleTopUp: handleTopUp2 } = await Promise.resolve().then(() => (init_wallet2(), wallet_exports));
      const { handleGetPlan: handleGetPlan2, handleRotateKey: handleRotateKey2 } = await Promise.resolve().then(() => (init_plan(), plan_exports));
      if (request.method === "GET" && url.pathname === "/v1/health") {
        return handleHealth(request, env);
      }
      if (request.method === "POST" && url.pathname === "/v1/auth/register") {
        return handleRegister2(request, env);
      }
      if (request.method === "POST" && url.pathname === "/v1/auth/login") {
        return handleLogin2(request, env);
      }
      if (request.method === "POST" && url.pathname === "/v1/auth/regenerate-key") {
        return handleRegenerateKey2(request, env);
      }
      if (request.method === "GET" && url.pathname === "/v1/me") {
        return handleMe2(request, env);
      }
      if (request.method === "GET" && url.pathname === "/v1/usage") {
        return handleUsage2(request, env);
      }
      if (request.method === "GET" && url.pathname === "/v1/rates") {
        return handleGetRates2(request, env);
      }
      if (request.method === "PUT" && url.pathname === "/v1/rates") {
        return handlePutRates2(request, env);
      }
      if (request.method === "GET" && url.pathname === "/v1/wallet") {
        return handleGetWallet2(request, env);
      }
      if (request.method === "POST" && url.pathname === "/v1/wallet/topup") {
        return handleTopUp2(request, env);
      }
      if (request.method === "GET" && url.pathname === "/v1/plan") {
        return handleGetPlan2(request, env);
      }
      if (request.method === "POST" && url.pathname === "/v1/keys/rotate") {
        return handleRotateKey2(request, env);
      }
      if (request.method === "POST" && url.pathname === "/v1/quote") {
        return handleQuote(request, env);
      }
      return errorResponse(
        "NOT_FOUND",
        "NOT_FOUND",
        `No route for ${request.method} ${url.pathname}`,
        404,
        headers
      );
    } catch (err) {
      console.error(err);
      return errorResponse(
        "ROUTING_FAILED",
        "ROUTING_FAILED",
        "Temporary server error. Safe to retry.",
        500,
        headers
      );
    }
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_modules_watch_stub();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_modules_watch_stub();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-hobTWD/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
init_modules_watch_stub();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-hobTWD/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
