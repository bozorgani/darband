# Ghahvino PWA implementation verification

Date: 2026-09-04. Initial branch: `main`. Initial commit: `652fd0dab5b540ad3a458dc419d478e544e34ba4`.
Remote was checked and already up to date. No push has been performed.

## Release decision

**Brand decision resolved: original brown SVG on #FBF8F4 approved by the owner.** The rejected redesigned icons have been replaced by deterministic rasterizations of the supplied SVG. Earlier engineering gates and 30 Lighthouse runs passed; those measurements predate this asset-only replacement. Updated icon/build checks are recorded below. Device/deployment acceptance remains outstanding; no push/deployment has been performed.

## Architecture and files

Manual dependency-free Service Worker; no next-pwa, Workbox, Serwist, push SDK or backend dependency was added.
The installed Next.js 16.3.4 PWA and manifest documentation was read. App Router metadata and Turbopack production build remain in use. Root layout remains a Server Component; existing SSR/SSG, store data, canonical metadata and JSON-LD were not replaced.

The existing development-only Playwright dependency was upgraded from 1.49.1 to 1.62.1 after a full audit exposed [GHSA-7mvr-c777-76hp](https://github.com/advisories/GHSA-7mvr-c777-76hp) (browser download certificate validation, fixed from 1.55.1). This does not enter the app runtime bundle. The updated release requires Node ≥20, compatible with this Node 24 host and Next 16. Lockfile regeneration also recorded bundled optional Tailwind WASI dependency metadata; no Tailwind/runtime version was upgraded. Post-upgrade `npm ci` passed with zero vulnerabilities after retrying an official-registry ECONNRESET; TypeScript, lint, build and production audit also passed. No TLS validation was disabled.

| File | Responsibility |
|---|---|
| `src/app/manifest.ts` | Typed App Router manifest |
| `src/app/layout.tsx` | Manifest/icon/Apple metadata; existing analytics preserved |
| `src/app/offline/page.tsx` | Branded server-rendered noindex fallback |
| `src/components/pwa/OfflineActions.tsx` | Retry, connectivity status and full-document home link |
| `src/components/pwa/PwaExperience.tsx` | Production registration, install, iOS guide, update consent, connectivity toasts |
| `src/components/layout/AppShell.tsx` | Mount PWA enhancement within existing providers |
| `src/app/globals.css` | Bottom safe-area utility |
| `src/pwa/worker.js` | Reviewed worker source |
| `scripts/build-pwa.cjs` | Build and inject deployment version |
| `public/sw.js` | Generated artifact, intentionally ignored by Git |
| `next.config.ts` | Worker MIME, no-store, scope and security headers |
| `public/icons/*.png`, `public/apple-touch-icon.png` | Installation assets |
| `qa/pwa.cjs` | Real-browser integration QA with isolated two-version proxy |
| `qa/pwa-worker.cjs` | Actual-source cache/security contract tests |

`npm run build` first runs Next build, then hashes `.next/BUILD_ID` plus worker source into a version. Always deploy that build's public directory with its Next output. Direct `next build` bypasses worker packaging. No bundler plugin or webpack-only configuration is needed. Worker source is about 9 KB uncompressed, with zero imported runtime libraries.

## Manifest and identity

| Field | Value |
|---|---|
| id / start_url / scope | `/` |
| name / short_name | قهوینو |
| description | فروشگاه آنلاین قهوه تازه‌رست و تخصصی قهوینو |
| lang / dir | fa-IR / rtl |
| display | standalone |
| display_override | window-controls-overlay, standalone, minimal-ui |
| orientation | portrait-primary |
| background_color | #fbf8f4, existing offwhite design token |
| theme_color | #22150e, existing espresso-900 design token |
| categories | shopping, food, lifestyle |
| shortcuts | /shop, /cart, /wishlist, /journal |

Shortcut availability does not imply offline access to private cart/wishlist. Apple status bar uses `default` and viewport fitting uses `auto` to avoid a translucent status bar overlapping the existing header. Real-device safe-area testing remains necessary. Optional screenshots and monochrome badge are not required for this phase and were not added. Existing OG is retained; favicon now uses the supplied official SVG.

## Source logo and icons

Original `public/ghahvino.png` remains untracked and byte-preserved: PNG, 1536×1024, alpha channel, 3:2 composition with G, wordmark/tagline and glow. It is a complete lockup, not a ready square installation icon.
SHA-256: `8E1B13EC5FC128C401CFE598DEDA3905F5BDCF1D59E0A75ECE6D658F08F6A989`.

The owner rejected the earlier generated redesign and supplied `C:\Users\bozor\Desktop\ghahvino.svg`. Its SVG content is preserved in `public/brand/ghahvino-logomark.svg` (verified identical after line-ending normalization). Both paths, the transform, viewBox and #2B1D17 fill remain unchanged. `scripts/build-icons.cjs` rasterizes this exact vector onto the explicitly approved #FBF8F4 background using uniform scaling/padding only. No AI generation, tracing, cropping, recoloring or glyph alteration is used. Desktop originals and the earlier `public/ghahvino.png` source remain untouched.

| Asset | Dimensions | Format / purpose |
|---|---|---|
| public/icons/icon-192.png | 192×192 | PNG, any |
| public/icons/icon-512.png | 512×512 | PNG, any |
| public/icons/maskable-icon-192.png | 192×192 | PNG, maskable |
| public/icons/maskable-icon-512.png | 512×512 | PNG, maskable |
| public/apple-touch-icon.png | 180×180 | PNG, Apple home-screen icon |
| src/app/favicon.ico | 16/32/48/256 | ICO with RGBA PNG frames of the same mark |

Maskable artwork is opaque. Pixel checks measured mark radius 29.10%/29.28% of image width for 192/512, safely inside the 40% radius circle. Normal PNG icons are 5,011/16,690 bytes; maskable PNGs are 4,241/14,357 bytes; Apple icon is 4,521 bytes. The renderer asserts dimensions, background RGB, opacity, visible artwork and maskable safe-zone bounds. Build successfully decodes the multiresolution favicon. Reproduce with `node scripts/build-icons.cjs`, then `npm run build` so worker version changes with the assets.

Post-replacement verification: original SVG content matches the Desktop source after line-ending normalization; original legacy PNG hash is unchanged; lint and production build pass; `qa/pwa.cjs` passes all 70 checks with the new assets; ICO contains 16/32/48/256 frames; `git diff --check` passes. Current generated worker version: `9b561f921c7cdfde`. The 30-run performance table below is historical to the preceding build, not a rerun after the smaller icon replacement.

## Cache matrix and limits

All owned caches start `ghahvino-pwa-` and include build version. Only GET, same-origin approved resources are eligible. Queued writes bound concurrent insertion; expiration is checked on reads and pruned on writes. Browser eviction/quota failure is treated as a normal limitation, not a guarantee of persistence.

| Resource | Strategy | Entry/age/body-size cap |
|---|---|---|
| Offline HTML and its actual HTML-referenced build dependencies | Version-pinned shell | 32 entries; ≤24 discovered dependencies; 2 MiB each |
| Allowlisted public document HTML, no query | Network-first, 4.5 s timeout | 24 entries; 30 min; 1 MiB each |
| /_next/static/* | Cache-first | 90 entries; 30 days; 2 MiB each |
| Local font requests outside /_next/static | Cache-first | 8 entries; 30 days; 512 KiB each |
| /images/*, /icons/*, Apple icon, approved /_next/image | Stale-while-revalidate | 60 entries; 7 days; 1 MiB each |
| Auth/account/cart/wishlist/checkout/payment/API | Worker bypass / network-only | Never stored by worker |
| RSC, Next prefetch, query HTML | Not persisted | RSC/prefetch bypass worker |
| Mutations and cross-origin resources | Worker bypass | Never stored |

Public HTML allowlist: `/`, `/shop`, `/product/:slug`, `/journal`, `/journal/:slug`, `/about`, `/faq`, `/shipping`, `/returns`, `/contact`, `/wholesale`, `/careers`, `/terms`, `/privacy`.
Next-generated fonts under `/_next/static/media` follow the static rule; the offline font is additionally pinned in the versioned shell.
No public HTML with any search query is persisted, preventing accidental storage of identifiers or personalized filters. Network success is preferred over snapshots. Offline price/availability is indicative only, never authorization to place an order.

Installation fails safely if offline HTML or a required shell dependency cannot be fetched/stored; an incomplete new worker cannot replace a working old worker. Shell dependencies are pinned separately from runtime caches. Activation deletes only owned obsolete cache names; unrelated origin caches survive. Workers do not call skipWaiting during install.

Pre-icon-replacement shell measurement: 15 build dependencies + offline HTML + two icons = 18 entries, 1,025,624 uncompressed bytes. Worker: 8,876 bytes. Measured build ID: `DqZ8v1NtsXYFUkNf1BkzG`; worker version at that measurement: `ead2ca1ca0afb942`. This is a limited offline shell, not a whole-site/product-image precache. Compression reduces transfer bytes; the figure above is local uncompressed content size, not a network benchmark.

## Privacy boundaries

Network-only roots AND descendants: `/auth`, `/account`, `/cart`, `/wishlist`, `/checkout`, `/payment`, `/api`.
POST, PUT, PATCH, DELETE, OPTIONS, Authorization-bearing requests, `Cache-Control: no-store`, RSC and prefetch requests bypass worker interception.
Responses with private/no-store, Set-Cookie, Vary Cookie/Authorization/*, redirects, opaque types or non-200 status are refused. HTML/image MIME is checked for corresponding runtime caches.

Public fetches use `credentials: omit`; navigation preload is disabled because preload can include credentials. This prevents creating cookie-personalized public snapshots. Browser JavaScript cannot reliably inspect the forbidden Set-Cookie response header, so credential omission and backend response policy remain essential defenses. A future personalized public page must be removed from the allowlist or separated into uncached authenticated data.

This policy governs Service Worker Cache Storage, not browser HTTP cache, Next Router Cache, localStorage or sessionStorage. Future private backend responses must independently send `Cache-Control: no-store`, use secure HttpOnly cookies and enforce server-side authorization. Existing mock sessions/local cart are unchanged and are not production authentication. No entered OTP, session payload, mobile number or private order response is deliberately logged or stored by this worker. Public frontend JavaScript still contains the existing mock constants/fixtures; these are not secret credentials or real backend data, and PWA does not make that mock architecture secure.

## Offline and shop flows

The offline page's main Persian message is server-rendered and visible without JavaScript. It has noindex/nofollow, no canonical and no sitemap entry. On navigation failure, a valid public snapshot is used; otherwise offline HTML is returned with **503**, X-Robots-Tag noindex/nofollow and no-store. Genuine online errors/redirects are passed through, never turned into cached 200 responses.

Retry reloads the original document; on direct `/offline` it returns to `/`. Home link uses full-document navigation intentionally because RSC is not cached. `navigator.onLine` is described as network state, not proof the store server is reachable.

Home/shop/product public documents can be revisited offline while fresh. Images/fonts already stored can be reused. Search/filter query results are not promised offline. Next client routing/RSC is network-only; not every SPA transition is guaranteed offline. Private document navigation offline may show a network failure instead of a cached account shell—this is intentional. Cart/wishlist local state may remain in existing localStorage, but their documents, auth, OTP, account, checkout and payment are never supplied from worker cache. No mutation replay/background purchase queue exists.

## Install and update UX

Chromium install event is stored; CTA waits 8 seconds and the native prompt is invoked only by a click. Dismissal is remembered for the session with storage-error fallback. App-installed and standalone detection hide CTA. Sensitive routes and cart/search/navigation overlays suppress install/update prompts.

iOS receives a delayed unobtrusive CTA, then a user-opened guide: Share → Add to Home Screen → Add. The dialog traps focus, restores scrolling and closes on Escape. This is a progressive-enhancement heuristic, not a guarantee of browser identity. Actual installation UI varies with iOS/browser versions.

A new worker remains waiting. GET_VERSION handshake supports per-version session dismissal. Only the update button sends SKIP_WAITING. Controllerchange reloads only the consenting tab and only once. Other tabs are not automatically refreshed; keep old hashed deployment assets available for them. Closing all old clients may allow normal browser activation without an interactive reload. No push notification permission is requested.

## QA evidence

| Gate | Observed result |
|---|---|
| TypeScript | PASS, noEmit |
| npm ci | PASS, 360 packages; final full audit 0 vulnerabilities |
| ESLint | PASS, no errors/warnings after targeted offline-navigation rationale |
| Production build | PASS, 58 prerendered/static routes |
| npm audit --omit=dev --audit-level=high | PASS, found 0 vulnerabilities |
| qa/flows.cjs | PASS, 29/29 |
| qa/auth.cjs | PASS, 55/55 |
| qa/seo.cjs | PASS, 35/35 |
| qa/responsive.cjs | CLEAN, 8 pages × 9 widths |
| qa/overflow.cjs | CLEAN, no overflow or console errors |
| qa/hyd.cjs | Five routes: no messages/dev portal |
| qa/pwa.cjs | PASS, 70 checks |
| qa/pwa-worker.cjs | PASS, 10 contract groups |
| Development browser probe | PASS, zero worker registrations on separate dev origin |
| git diff --check | PASS; Git CRLF normalization notices only |

Integration tests inspect actual Cache Storage entries/bodies, cache expiry, private/no-store fixtures, every mutation method, 503 fallback and two genuinely different worker versions. Proxy network disconnection is used in addition to Playwright offline emulation because this Chrome/Playwright combination did not disconnect worker-originated fetches with context emulation alone. Installability uses an isolated regular temporary profile: Chromium reports no installability errors. Incognito cannot install and is not accepted as proof.

Archived baseline regression suite also passed: flows 29/29, auth 55/55, SEO 35/35, responsive 7×9, overflow clean, hydration clean. Only test origin (port 3001), executable path and a longer navigation timeout were adapted in an external runner; baseline assertions/files were unchanged. Two baseline Image Optimizer requests initially hung; restarting that server resolved the timeout. Both baseline and final server logs emitted Next's existing NoFallbackError during unknown-route probes, while their browser/regression checks passed; this was not silently attributed to PWA or fixed outside scope.

Update consent produces exactly one document request, old owned caches are removed, unrelated cache is preserved and prompt does not loop. Install/update/iOS/offline bounds are tested at 320, 360, 375, 390, 412, 768, 1024, 1280, 1440. iOS behavior is Chromium UA/standalone emulation, **not Safari engine/device certification**. Original QA assertions were retained; browser executable override was added for the available system Chrome.

Installed `window-controls-overlay` detection is covered with an explicit MediaQueryList fixture because CDP did not emulate that OS display mode. It is not a claim that an actual installed desktop window was tested. Mobile offline, update and iOS screenshots were visually inspected; the update dismissal button's initially dark-on-dark styling was corrected using the existing light button variant.

## Performance / SEO

Five-route, three-run mobile Lighthouse medians were measured against a clean archive of the initial commit, under the same browser and throttling settings. Lighthouse 12.8.2, Chrome 152, mobile simulated throttling: RTT 150 ms, throughput 1638.4 Kbps, CPU slowdown 4×. Each run had a fresh browser profile; baseline and PWA were interleaved, with no other QA running alongside. Baseline uses a node_modules junction and temporary Turbopack root setting solely to resolve that junction; application source remains baseline. Results are stored outside the repository. These are fresh measurements, not the older audit's historical numbers.

All 30 runs completed. Before → after; times in milliseconds, median of three per variant/route:

| Route | Performance | LCP ms | TBT ms |
|---|---|---|---|
| / | 86 → 89 | 3683.1 → 3682.5 | 124 → 112 |
| /shop | 83 → 83 | 4282.0 → 4283.0 | 164.5 → 173.5 |
| /product/ethiopia-yirgacheffe | 90 → 90 | 3533.4 → 3607.7 | 69 → 73 |
| /journal | 91 → 91 | 3457.8 → 3457.1 | 54 → 68.5 |
| /about | 92 → 92 | 3230.6 → 3307.0 | 67 → 64 |

**Accessibility = 100, Best Practices = 100, SEO = 100, CLS = 0 in every baseline and PWA run.** No median performance score decreased. Product/about LCP increased about 74/76 ms (2.1%/2.4%); the largest median TBT increase was 14.5 ms. These small absolute changes do not indicate a material regression in this local three-run sample, but are not a promise about every device/network. Home's score increase must not be interpreted as proven causal acceleration by PWA.

Raw reports and medians: `C:\Users\bozor\Documents\ghahvino-pwa-verification\lighthouse-final\`. Earlier incomplete exploratory runs in `lighthouse/` were not used in this table. Windows intermittently locked Chrome's temporary profile during cleanup after the process was stopped; results were retained and no metrics were discarded for being slow.

SSR/SSG and canonical/product schema checks pass. Offline 503 avoids a soft-404 success response; offline content is excluded from sitemap. No crawler UA branching exists. Worker registration is scheduled after load/idle and never shifts document layout. First visits still need network; precache consumes extra background traffic. Repeat visits may benefit, but that does not excuse an initial-load performance regression.

## iOS and backend roadmap

Safari does not provide Chromium's beforeinstallprompt. Installation, standalone safe areas, system status bar and storage behavior need real-device acceptance. Storage may be evicted; offline data is not durable storage. Background execution/sync is not promised. The installed Next guide documents Web Push for home-screen iOS/iPadOS apps from 16.4 onward, but this implementation requests no permission and includes no push handler, badges or subscription backend.

Future push requires a backend subscription store, VAPID/secrets, explicit contextual permission, unsubscribe/preferences, expiry handling and rate limiting. Useful opt-in events may include order/shipping status and requested back-in-stock notifications. Promotional spam and permission-on-first-visit are excluded. Real auth/payment need their own security design; no cached OTP, payment retry queue or offline checkout is introduced.

## Remaining release checks

1. Official icon fidelity/approval is resolved: supplied SVG and brown-on-light treatment are now used.
2. Real iPhone installation, safe-area and lifecycle; Android/desktop installed-window smoke test (including OS titlebar layout in window-controls-overlay); production HTTPS/CDN headers after deployment.
3. Commit only after required gates and asset approval; never push without permission.

Reproduction and narrowly scoped development cleanup are in RUN.md. Artifacts, browser profiles, Lighthouse JSON and screenshots are outside Git. Original source logo remains untouched.

### Final command checklist

```bash
npx tsc --noEmit
npm run lint
npm run build
npm audit --omit=dev --audit-level=high
npm start
# Separate terminal, while production server is running:
node qa/flows.cjs
node qa/auth.cjs
node qa/seo.cjs
node qa/responsive.cjs
node qa/overflow.cjs
node qa/hyd.cjs
node qa/pwa-worker.cjs
node qa/pwa.cjs
git diff --check
git status --short
git diff --stat
```

This Windows host's npm shim was broken, so its installed `npm-cli.js` was invoked through Node for npm commands. No audit failure was bypassed with insecure TLS. Production audit ultimately completed successfully. Browser tests use installed Chrome through `PLAYWRIGHT_EXECUTABLE_PATH`; no dependency or assertion was removed to obtain a pass.

### Git handoff

No commit or push/deployment was performed. The working tree contains implementation changes and the preserved pre-existing untracked source logo. Icon approval is now resolved; the most recent icon-only change does not constitute a fresh full release/performance certification. Generated worker, screenshots and Lighthouse artifacts are excluded.

Git snapshot before the final official-icon replacement (the latest changes additionally include `public/brand/`, `scripts/build-icons.cjs` and modified `src/app/favicon.ico`):

```text
 M .gitignore
 M README.md
 M RUN.md
 M eslint.config.mjs
 M next.config.ts
 M package-lock.json
 M package.json
 M qa/auth.cjs
 M qa/flows.cjs
 M qa/hyd.cjs
 M qa/overflow.cjs
 M qa/responsive.cjs
 M qa/seo.cjs
 M qa/shots-auth.cjs
 M qa/shots.cjs
 M src/app/globals.css
 M src/app/layout.tsx
 M src/components/layout/AppShell.tsx
?? PWA_IMPLEMENTATION_REPORT.md
?? public/apple-touch-icon.png
?? public/ghahvino.png
?? public/icons/
?? qa/pwa-worker.cjs
?? qa/pwa.cjs
?? scripts/
?? src/app/manifest.ts
?? src/app/offline/
?? src/components/pwa/
?? src/pwa/
```
