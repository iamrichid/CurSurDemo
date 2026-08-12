var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../src/utils/pricing.js
var defaultRates = {
  bicycle: { baseFare: 5, perKm: 1.2, perMinute: 0.15, label: "Bicycle" },
  motorbike: { baseFare: 8, perKm: 1.8, perMinute: 0.25, label: "Motorbike (Okada)" },
  car: { baseFare: 15, perKm: 3.5, perMinute: 0.45, label: "Car" }
};
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
__name(calculateQuote, "calculateQuote");

// src/http.js
function corsHeaders(request, env) {
  const allowed = (env.ALLOWED_ORIGINS || "*").split(",").map((s) => s.trim());
  const origin = request.headers.get("Origin") || "";
  const allowOrigin = allowed.includes("*") || allowed.includes(origin) ? origin || "*" : allowed[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400"
  };
}
__name(corsHeaders, "corsHeaders");
function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders
    }
  });
}
__name(json, "json");
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
__name(errorResponse, "errorResponse");
function checkApiKey(request, env) {
  const keysRaw = env.ANY3MI_API_KEYS;
  if (!keysRaw || !keysRaw.trim()) return { ok: true };
  const auth = request.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const allowed = keysRaw.split(",").map((k) => k.trim()).filter(Boolean);
  if (!token || !allowed.includes(token)) {
    return {
      ok: false,
      status: 401,
      code: "UNAUTHORIZED",
      message: "Missing or invalid API key."
    };
  }
  return { ok: true };
}
__name(checkApiKey, "checkApiKey");

// src/routing.js
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

// src/validate.js
var GHANA = {
  latMin: 4.5,
  latMax: 11.5,
  lngMin: -3.5,
  lngMax: 1.5
};
var SUPPORTED_VEHICLES = /* @__PURE__ */ new Set(["bicycle", "motorbike", "car"]);
function isInGhana(lat, lng) {
  return lat >= GHANA.latMin && lat <= GHANA.latMax && lng >= GHANA.lngMin && lng <= GHANA.lngMax;
}
__name(isInGhana, "isInGhana");
function validateQuoteRequest(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, status: 400, code: "INVALID_REQUEST", message: "JSON body required." };
  }
  const { origin, destination, vehicle } = body;
  if (!SUPPORTED_VEHICLES.has(vehicle)) {
    return {
      ok: false,
      status: 422,
      code: "UNSUPPORTED_VEHICLE",
      message: "Vehicle type not recognized."
    };
  }
  for (const label of ["origin", "destination"]) {
    const point = body[label];
    if (!point || typeof point.lat !== "number" || typeof point.lng !== "number" || Number.isNaN(point.lat) || Number.isNaN(point.lng)) {
      return {
        ok: false,
        status: 400,
        code: "INVALID_COORDINATES",
        message: `${label} must include numeric lat and lng.`
      };
    }
    if (!isInGhana(point.lat, point.lng)) {
      return {
        ok: false,
        status: 400,
        code: "INVALID_COORDINATES",
        message: "Lat/lng out of supported Ghana bounds."
      };
    }
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

// src/index.js
async function handleHealth(request, env) {
  const headers = corsHeaders(request, env);
  return json(
    {
      status: "ok",
      service: "any3mi-api",
      version: "1.0.0",
      routing: env.ORS_API_KEY ? "openrouteservice" : "unconfigured"
    },
    200,
    headers
  );
}
__name(handleHealth, "handleHealth");
async function handleQuote(request, env) {
  const headers = corsHeaders(request, env);
  const auth = checkApiKey(request, env);
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
  let metrics;
  try {
    metrics = await fetchRouteMetrics(env, origin, destination, vehicle);
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
  const quote = calculateQuote(
    defaultRates,
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
  return json(
    {
      status: "success",
      route: {
        origin: formatPlaceLabel(origin.lat, origin.lng),
        destination: formatPlaceLabel(destination.lat, destination.lng)
      },
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
      if (request.method === "GET" && url.pathname === "/v1/health") {
        return handleHealth(request, env);
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
        "Temporary routing engine error. Safe to retry.",
        500,
        headers
      );
    }
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
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

// .wrangler/tmp/bundle-2ijUP4/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
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

// .wrangler/tmp/bundle-2ijUP4/middleware-loader.entry.ts
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
