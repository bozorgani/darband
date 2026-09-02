/**
 * QA — Ghahvino brand + technical SEO.
 * Requires the production build running on http://localhost:3000
 *   node qa/seo.cjs
 */
const { chromium } = require("playwright");

const BASE = "http://localhost:3000";
const CANONICAL_HOST = "https://ghahvino.ir";
const BRAND = "قهوینو";
const LEGACY = ["darband.coffee", "دربند", "DARBAND", "Darband"];

const PUBLIC_PAGES = [
  "/",
  "/shop",
  "/product/ethiopia-yirgacheffe",
  "/journal",
  "/journal/art-of-pourover",
  "/about",
  "/contact",
  "/faq",
  "/shipping",
  "/returns",
  "/terms",
  "/privacy",
];
const PRIVATE_PAGES = ["/auth", "/auth/verify", "/account", "/account/orders", "/cart", "/wishlist"];

const results = [];
const check = (name, ok, extra = "") =>
  results.push(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? " :: " + extra : ""}`);

const meta = (page, selector, attr = "content") =>
  page.locator(selector).first().getAttribute(attr).catch(() => null);

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ locale: "fa-IR", viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  /* ---------------------------------------------------------------- 1–5, 11 */
  const missingTitle = [];
  const wrongBrand = [];
  const legacyHits = [];
  const badCanonical = [];
  const noindexPublic = [];
  const badH1 = [];
  const badLang = [];
  const invalidJsonLd = [];
  const missingAlt = [];

  for (const route of PUBLIC_PAGES) {
    const res = await page.goto(BASE + route, { waitUntil: "networkidle" });
    if (!res || res.status() !== 200) missingTitle.push(`${route} status ${res && res.status()}`);

    const title = (await page.title()).trim();
    if (!title) missingTitle.push(route);
    if (!title.includes(BRAND)) wrongBrand.push(`${route} → ${title}`);

    const html = await page.content();
    for (const needle of LEGACY) if (html.includes(needle)) legacyHits.push(`${route} → ${needle}`);

    const canonical = await meta(page, 'link[rel="canonical"]', "href");
    if (!canonical || !canonical.startsWith(CANONICAL_HOST) || canonical.includes("?")) {
      badCanonical.push(`${route} → ${canonical}`);
    }

    const robots = (await meta(page, 'meta[name="robots"]')) || "";
    if (/noindex/i.test(robots)) noindexPublic.push(`${route} → ${robots}`);

    const h1 = await page.locator("h1").allInnerTexts();
    if (h1.length !== 1 || !h1[0].trim()) badH1.push(`${route} → ${h1.length} H1`);

    const lang = await page.locator("html").getAttribute("lang");
    const dir = await page.locator("html").getAttribute("dir");
    if (lang !== "fa" || dir !== "rtl") badLang.push(`${route} → ${lang}/${dir}`);

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    for (const raw of blocks) {
      try {
        const parsed = JSON.parse(raw);
        if (!parsed["@context"] || !parsed["@type"]) invalidJsonLd.push(`${route} → missing @type`);
        if (JSON.stringify(parsed).includes("دربند")) invalidJsonLd.push(`${route} → legacy brand`);
      } catch (e) {
        invalidJsonLd.push(`${route} → ${e.message}`);
      }
    }

    const imgs = await page.locator("main img").evaluateAll((nodes) =>
      nodes
        .filter((n) => n.getAttribute("alt") === null)
        .map((n) => n.getAttribute("src") || "?"),
    );
    if (imgs.length) missingAlt.push(`${route} → ${imgs.length} img without alt`);
  }

  check("Every public page returns 200 with a title", missingTitle.length === 0, missingTitle.join(", "));
  check("Every public title carries the Ghahvino brand", wrongBrand.length === 0, wrongBrand.join(" | "));
  check("No legacy brand string in public HTML", legacyHits.length === 0, legacyHits.slice(0, 4).join(" | "));
  check("Canonicals are absolute https://ghahvino.ir URLs without query", badCanonical.length === 0, badCanonical.join(" | "));
  check("No public page is noindex", noindexPublic.length === 0, noindexPublic.join(" | "));
  check("Every public page has exactly one H1", badH1.length === 0, badH1.join(" | "));
  check("html lang=fa and dir=rtl everywhere", badLang.length === 0, badLang.join(" | "));
  check("All JSON-LD blocks parse and are brand-clean", invalidJsonLd.length === 0, invalidJsonLd.join(" | "));
  check("All content images expose an alt attribute", missingAlt.length === 0, missingAlt.join(" | "));

  /* -------------------------------------------------------------------- 6 */
  const indexablePrivate = [];
  for (const route of PRIVATE_PAGES) {
    await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
    const robots = (await meta(page, 'meta[name="robots"]')) || "";
    if (!/noindex/i.test(robots)) indexablePrivate.push(`${route} → ${robots || "(none)"}`);
  }
  check("Auth, account, cart and wishlist are noindex", indexablePrivate.length === 0, indexablePrivate.join(" | "));

  /* ---------------------------------------------------------------- 7–10, 20 */
  const sitemapXml = await (await ctx.request.get(`${BASE}/sitemap.xml`)).text();
  const locs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  check("Sitemap is non-empty", locs.length > 10, `${locs.length} urls`);
  check(
    "Every sitemap URL uses https://ghahvino.ir",
    locs.every((u) => u.startsWith(`${CANONICAL_HOST}/`)),
    locs.filter((u) => !u.startsWith(CANONICAL_HOST)).slice(0, 3).join(" | "),
  );
  check("Sitemap contains no query URLs", !locs.some((u) => u.includes("?")),
    locs.filter((u) => u.includes("?")).slice(0, 3).join(" | "));
  const forbidden = locs.filter((u) => /\/(auth|account|cart|wishlist)(\/|$)/.test(u));
  check("Sitemap excludes auth, account, cart and wishlist", forbidden.length === 0, forbidden.join(" | "));

  const badStatus = [];
  for (const url of locs) {
    const path = url.replace(CANONICAL_HOST, "") || "/";
    const res = await ctx.request.get(BASE + path);
    if (res.status() !== 200) badStatus.push(`${path} → ${res.status()}`);
  }
  check("Every sitemap URL responds 200", badStatus.length === 0, badStatus.join(" | "));

  const robotsTxt = await (await ctx.request.get(`${BASE}/robots.txt`)).text();
  check(
    "robots.txt points at the Ghahvino sitemap",
    robotsTxt.includes(`Sitemap: ${CANONICAL_HOST}/sitemap.xml`) && !robotsTxt.includes("darband"),
    robotsTxt.split("\n").filter((l) => l.startsWith("Sitemap")).join(""),
  );
  check(
    "robots.txt keeps private routes out and assets in",
    /Disallow: \/account/.test(robotsTxt) &&
      /Disallow: \/auth/.test(robotsTxt) &&
      !/Disallow: \/_next/.test(robotsTxt),
  );

  /* ------------------------------------------------------------- 13, 14, 15 */
  await page.goto(`${BASE}/product/ethiopia-yirgacheffe`, { waitUntil: "networkidle" });
  const productBlocks = (
    await page.locator('script[type="application/ld+json"]').allTextContents()
  ).map((t) => JSON.parse(t));
  const product = productBlocks.find((b) => b["@type"] === "Product");
  check("Product schema exists with the Ghahvino brand", Boolean(product) && product.brand.name === BRAND,
    product && product.brand && product.brand.name);
  const uiPrice = Number(
    (await page.locator("main").innerText())
      .match(/([\d۰-۹,،]+)\s*تومان/)[1]
      .replace(/[,،]/g, "")
      .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)),
  );
  check(
    "Product offer price is the Toman UI price converted to IRR (×10)",
    product.offers.priceCurrency === "IRR" && Number(product.offers.price) === uiPrice * 10,
    `ui=${uiPrice} toman → schema=${product.offers.price} ${product.offers.priceCurrency}`,
  );
  check(
    "Product offer carries condition, availability and an absolute canonical url",
    product.offers.itemCondition === "https://schema.org/NewCondition" &&
      /^https:\/\/schema\.org\/(In|OutOf)Stock$/.test(product.offers.availability) &&
      product.offers.url === `${CANONICAL_HOST}/product/ethiopia-yirgacheffe`,
    product.offers.url,
  );
  const productCrumbs = productBlocks.find((b) => b["@type"] === "BreadcrumbList");
  check("Product page has a BreadcrumbList", Boolean(productCrumbs) && productCrumbs.itemListElement.length >= 3);

  await page.goto(`${BASE}/journal/art-of-pourover`, { waitUntil: "networkidle" });
  const articleBlocks = (
    await page.locator('script[type="application/ld+json"]').allTextContents()
  ).map((t) => JSON.parse(t));
  const article = articleBlocks.find((b) => b["@type"] === "BlogPosting");
  check(
    "Article schema is valid, Persian and published by Ghahvino",
    Boolean(article) &&
      article.publisher.name === BRAND &&
      article.inLanguage === "fa-IR" &&
      /^\d{4}-\d{2}-\d{2}$/.test(article.datePublished) &&
      article.mainEntityOfPage["@id"].startsWith(CANONICAL_HOST),
    article && article.datePublished,
  );

  await page.goto(BASE, { waitUntil: "networkidle" });
  const homeBlocks = (
    await page.locator('script[type="application/ld+json"]').allTextContents()
  ).map((t) => JSON.parse(t));
  const store = homeBlocks.find((b) => b["@type"] === "OnlineStore");
  const website = homeBlocks.find((b) => b["@type"] === "WebSite");
  check(
    "OnlineStore + WebSite schema use the Ghahvino name and canonical host",
    Boolean(store) &&
      store.name === BRAND &&
      store.alternateName === "Ghahvino" &&
      store.url.startsWith(CANONICAL_HOST) &&
      Boolean(website) &&
      website.url.startsWith(CANONICAL_HOST),
  );
  check(
    "Store schema contains no unverified contact data",
    !("telephone" in (store || {})) && !("address" in (store || {})) && !("email" in (store || {})),
  );

  /* ------------------------------------------------------------------- 12 */
  const ogChecks = [];
  for (const route of ["/", "/shop", "/product/ethiopia-yirgacheffe", "/journal/art-of-pourover"]) {
    await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
    const siteName = await meta(page, 'meta[property="og:site_name"]');
    const locale = await meta(page, 'meta[property="og:locale"]');
    const ogTitle = await meta(page, 'meta[property="og:title"]');
    const ogImage = await meta(page, 'meta[property="og:image"]');
    const twitter = await meta(page, 'meta[name="twitter:card"]');
    if (siteName !== BRAND || locale !== "fa_IR" || !ogTitle || !ogImage || !twitter) {
      ogChecks.push(`${route} → ${siteName}/${locale}/${twitter}`);
    }
  }
  check("Open Graph + Twitter metadata are Ghahvino-branded", ogChecks.length === 0, ogChecks.join(" | "));

  /* ------------------------------------------------------------------- 16 */
  const seen = new Set();
  const broken = [];
  for (const route of ["/", "/shop", "/journal", "/about", "/contact"]) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    const hrefs = await page.locator("a[href]").evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute("href")),
    );
    for (const href of hrefs) {
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        if (href === "#") broken.push(`${route} → href="#"`);
        continue;
      }
      if (!href.startsWith("/")) continue;
      const path = href.split("#")[0];
      if (!path || seen.has(path)) continue;
      seen.add(path);
      const res = await ctx.request.get(BASE + path);
      if (res.status() >= 400) broken.push(`${route} → ${path} (${res.status()})`);
    }
  }
  check(`No broken internal links (${seen.size} checked)`, broken.length === 0, broken.join(" | "));

  /* ------------------------------------------------------------------- 19 */
  const legacyMeta = [];
  for (const route of PUBLIC_PAGES) {
    const res = await ctx.request.get(BASE + route);
    const html = await res.text();
    const head = html.slice(0, html.indexOf("</head>"));
    if (/darband|دربند/i.test(head)) legacyMeta.push(route);
  }
  check("No legacy brand in <head> metadata of any public page", legacyMeta.length === 0, legacyMeta.join(", "));

  await browser.close();
  console.log(results.join("\n"));
  const failures = results.filter((r) => r.startsWith("FAIL")).length;
  console.log(`\n${failures} failures / ${results.length} checks`);
  process.exitCode = failures ? 1 : 0;
})();
