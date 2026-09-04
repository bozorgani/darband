/* Manual worker. scripts/build-pwa.cjs injects an immutable deployment version. */
const VERSION = "__BUILD_VERSION__";
const PREFIX = "ghahvino-pwa-";
const CACHES = Object.fromEntries(["shell", "pages", "static", "images", "fonts"].map((kind) => [kind, PREFIX + kind + "-" + VERSION]));
const POLICIES = {
  pages: { entries: 24, age: 30 * 60 * 1000, bytes: 1024 * 1024 },
  static: { entries: 90, age: 30 * 86400000, bytes: 2 * 1024 * 1024 },
  images: { entries: 60, age: 7 * 86400000, bytes: 1024 * 1024 },
  fonts: { entries: 8, age: 30 * 86400000, bytes: 512 * 1024 },
  shell: { entries: 32, age: Infinity, bytes: 2 * 1024 * 1024 },
};
const PRIVATE_PATH = /^\/(?:auth|account|cart|wishlist|checkout|payment|api)(?:\/|$)/i;
const PUBLIC_PATH = /^(?:\/|\/(?:shop|about|faq|shipping|returns|contact|wholesale|careers|terms|privacy|journal)\/?|\/(?:product|journal)\/[^/]+\/?)$/;
const STAMP = "x-ghahvino-cached-at";
const queues = new Map();

self.addEventListener("install", (event) => event.waitUntil(installShell()));
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // Preload includes cookies and is intentionally disabled: public snapshots use credentials:omit.
    await self.registration.navigationPreload?.disable().catch(() => {});
    const keys = await caches.keys().catch(() => []);
    await Promise.all(keys.filter((key) => key.startsWith(PREFIX) && !Object.values(CACHES).includes(key)).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("message", (event) => {
  if (!event.source || !event.source.url || new URL(event.source.url).origin !== self.location.origin) return;
  if (event.data?.type === "GET_VERSION") event.ports[0]?.postMessage({ version: VERSION });
  // Activation is never requested during install; only an explicit UI action sends this message.
  if (event.data?.type === "SKIP_WAITING") event.waitUntil(self.skipWaiting());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || privateRequest(request, url)) return;
  if (request.mode === "navigate") {
    event.respondWith(navigation(event));
    return;
  }
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, "static"));
  } else if (request.destination === "font" && /\.(?:woff2?|ttf|otf)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, "fonts"));
  } else if (request.destination === "image" && imageAllowed(url)) {
    event.respondWith(imageResponse(event));
  }
});

function privateRequest(request, url) {
  return PRIVATE_PATH.test(url.pathname) || request.headers.has("authorization") ||
    request.headers.has("next-router-prefetch") || request.headers.get("rsc") === "1" ||
    url.searchParams.has("_rsc") || /no-store/i.test(request.headers.get("cache-control") || "");
}
function imageAllowed(url) {
  if (url.pathname.startsWith("/images/") || url.pathname.startsWith("/icons/") || url.pathname === "/apple-touch-icon.png") return true;
  if (url.pathname !== "/_next/image") return false;
  try {
    const source = new URL(url.searchParams.get("url"), self.location.origin);
    return source.origin === self.location.origin && source.pathname.startsWith("/images/");
  } catch { return false; }
}
function cacheable(response, kind) {
  if (!response || response.status !== 200 || response.redirected || !["basic", "default"].includes(response.type)) return false;
  if (response.headers.has("set-cookie") || /private|no-store/i.test(response.headers.get("cache-control") || "")) return false;
  if (/cookie|authorization|\*/i.test(response.headers.get("vary") || "")) return false;
  const type = response.headers.get("content-type") || "";
  if (kind === "pages") return type.includes("text/html");
  if (kind === "images") return type.startsWith("image/");
  return true;
}
function publicFetch(request, timeout = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  return fetch(request, { credentials: "omit", signal: controller.signal }).finally(() => clearTimeout(timer));
}
async function read(kind, request) {
  try {
    const cache = await caches.open(CACHES[kind]);
    const response = await cache.match(request);
    if (!response) return undefined;
    const age = Date.now() - Number(response.headers.get(STAMP) || 0);
    if (age >= POLICIES[kind].age) {
      await cache.delete(request);
      return undefined;
    }
    return response;
  } catch { return undefined; }
}
function put(kind, request, response) {
  // Serial writes enforce entry limits even when many image requests complete together.
  const operation = (queues.get(kind) || Promise.resolve()).then(async () => {
    if (!cacheable(response, kind)) return;
    const policy = POLICIES[kind];
    const length = Number(response.headers.get("content-length"));
    if (length > policy.bytes) return;
    const body = await response.arrayBuffer();
    if (body.byteLength > policy.bytes) return;
    const headers = new Headers(response.headers);
    headers.set(STAMP, String(Date.now()));
    headers.delete("content-encoding");
    headers.delete("content-length");
    const cache = await caches.open(CACHES[kind]);
    await cache.put(request, new Response(body, { status: 200, headers }));
    for (const key of await cache.keys()) {
      const entry = await cache.match(key);
      if (Date.now() - Number(entry?.headers.get(STAMP) || 0) >= policy.age) await cache.delete(key);
    }
    const keys = await cache.keys();
    await Promise.all(keys.slice(0, Math.max(0, keys.length - policy.entries)).map((key) => cache.delete(key)));
  }).catch(() => {}); // Quota/disabled Cache Storage must not break successful network responses.
  queues.set(kind, operation);
  return operation;
}
async function installShell() {
  const offline = await publicFetch("/offline");
  if (!cacheable(offline, "pages")) throw new Error("Offline shell unavailable");
  const html = await offline.clone().text();
  // Match actual HTML attributes, not escaped URLs inside the RSC inline payload.
  const assets = [...new Set([...html.matchAll(/(?:src|href)=["'](\/_next\/static\/[^"'\\]+)["']/g)].map((match) => match[1].replaceAll("&amp;", "&")))];
  if (assets.length > 24) throw new Error("Offline precache budget exceeded");
  // Pin the shell dependencies separately; runtime LRU cannot evict the fallback's CSS/JS/font.
  for (const asset of ["/icons/icon-192.png", "/apple-touch-icon.png", ...assets]) {
    const response = await publicFetch(asset);
    if (!cacheable(response, "shell")) throw new Error("Offline asset unavailable");
    await put("shell", asset, response);
    if (!(await read("shell", asset))) throw new Error("Offline asset could not be stored");
  }
  await put("shell", "/offline", offline);
  if (!(await read("shell", "/offline"))) throw new Error("Offline shell could not be stored");
}
async function fallback() {
  const shell = await read("shell", "/offline");
  if (!shell) return new Response("اتصال اینترنت در دسترس نیست", { status: 503, headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex, nofollow" } });
  // A fallback is not a successful representation of an unknown URL.
  const headers = new Headers(shell.headers);
  headers.set("x-robots-tag", "noindex, nofollow");
  headers.set("cache-control", "no-store");
  return new Response(shell.body, { status: 503, headers });
}
async function navigation(event) {
  const request = event.request;
  const url = new URL(request.url);
  try {
    const response = await publicFetch(request, 4500);
    // Unknown query parameters may contain private identifiers; do not persist any query HTML.
    if (PUBLIC_PATH.test(url.pathname) && !url.search && cacheable(response, "pages")) {
      event.waitUntil(put("pages", request, response.clone()));
    }
    return response; // Preserve genuine online 404/401/500 and redirects.
  } catch {
    return (PUBLIC_PATH.test(url.pathname) && !url.search && await read("pages", request)) || fallback();
  }
}
async function cacheFirst(request, kind) {
  const hit = await read("shell", request) || await read(kind, request);
  if (hit) return hit;
  const response = await publicFetch(request);
  await put(kind, request, response.clone());
  return response;
}
async function imageResponse(event) {
  const request = event.request;
  const hit = await read("shell", request) || await read("images", request);
  const network = publicFetch(request).then(async (response) => {
    await put("images", request, response.clone());
    return response;
  });
  if (hit) {
    event.waitUntil(network.catch(() => {}));
    return hit;
  }
  return network;
}
