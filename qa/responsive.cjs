/**
 * QA — post-rebrand responsive sweep (header/footer/logo/typography).
 * Requires the production build running on http://localhost:3000
 *   node qa/responsive.cjs
 */
const { chromium } = require("playwright");

const BASE = "http://localhost:3000";
const WIDTHS = [320, 360, 375, 390, 412, 768, 1024, 1280, 1440];
const PAGES = ["/", "/shop", "/product/ethiopia-yirgacheffe", "/journal", "/about", "/auth", "/account", "/offline"];

const SESSION = {
  id: "u-001",
  phone: "+989121234567",
  phoneVerified: true,
  firstName: "سارا",
  lastName: "محمدی",
  email: "sara.mohammadi@example.com",
  credit: 250000,
  loyaltyPoints: 1240,
  createdAt: "۱۴۰۲/۱۱/۰۳",
  acceptedTerms: true,
  newsletter: true,
};

const problems = [];

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH });

  for (const width of WIDTHS) {
    const ctx = await browser.newContext({
      viewport: { width, height: 900 },
      locale: "fa-IR",
      reducedMotion: "reduce",
    });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => problems.push(`${width}px pageerror: ${e.message}`));
    page.on("console", (m) => {
      const t = m.text();
      if (m.type() === "error" && !t.includes("404")) problems.push(`${width}px console: ${t}`);
    });

    /* Signed-in session so /account renders the panel, not the guard skeleton. */
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.evaluate((s) => localStorage.setItem("darband.auth.session.v1", JSON.stringify(s)), SESSION);

    for (const route of PAGES) {
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      await page.waitForTimeout(350);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      if (overflow > 0) problems.push(`${width}px ${route}: horizontal overflow ${overflow}px`);

      /* Brand wordmark must stay inside the header and stay legible. */
      const logo = await page
        .locator('header a[href="/"]')
        .first()
        .evaluate((el) => {
          const r = el.getBoundingClientRect();
          return { right: r.right, left: r.left, height: r.height, text: el.innerText.trim() };
        })
        .catch(() => null);
      if (!logo) problems.push(`${width}px ${route}: no header logo link`);
      else {
        if (logo.left < -1 || logo.right > width + 1) {
          problems.push(`${width}px ${route}: logo clipped (${logo.left}→${logo.right})`);
        }
        if (logo.height < 20) problems.push(`${width}px ${route}: logo height ${logo.height}`);
        if (!logo.text.includes("قهوینو")) {
          problems.push(`${width}px ${route}: logo text "${logo.text}"`);
        }
      }

      /* Header actions must stay reachable (not pushed off-screen). */
      const actions = await page.evaluate(() => {
        const nodes = [...document.querySelectorAll("header button, header a")];
        return nodes.filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && (r.right > window.innerWidth + 2 || r.left < -2);
        }).length;
      });
      if (actions > 0) problems.push(`${width}px ${route}: ${actions} header control(s) outside the viewport`);
    }

    /* Mobile menu still opens and closes after the rebrand. */
    if (width < 1024) {
      await page.goto(BASE, { waitUntil: "networkidle" });
      const burger = page.getByRole("button", { name: /منو/ }).first();
      if ((await burger.count()) === 0) problems.push(`${width}px: mobile menu button missing`);
      else {
        await burger.click();
        await page.waitForTimeout(400);
        const navVisible = await page.getByRole("dialog").first().isVisible().catch(() => false);
        if (!navVisible) problems.push(`${width}px: mobile menu did not open`);
        await page.keyboard.press("Escape");
        await page.waitForTimeout(300);
      }
    }

    await ctx.close();
  }

  /* Cart page with populated items must never overflow horizontally at any
     width. The summary/items grid requires `min-w-0` on its columns and the
     discount row to wrap/shrink, otherwise an unbreakable child forces the
     whole page to ~67px wider than a 320px viewport. */
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({
      viewport: { width, height: 900 },
      locale: "fa-IR",
      reducedMotion: "reduce",
    });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      localStorage.setItem("darband.cart.v1", JSON.stringify([
        { key: "e", productId: "ethiopia-yirgacheffe", slug: "ethiopia-yirgacheffe",
          title: "اتیوپی یرگاچف", image: "/images/products/ethiopia-1.jpg", unitPrice: 485000,
          quantity: 2, options: [{ label: "نوع", value: "دانه کامل" }, { label: "وزن", value: "۲۵۰ گرم" }] },
        { key: "g", productId: "m-1", slug: "manual-grinder", title: "آسیاب دستی حرفه‌ای",
          image: "/images/products/grinder-1.jpg", unitPrice: 2400000, quantity: 1, options: [] },
      ]));
    });
    await page.goto(BASE + "/cart", { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow > 0) problems.push(`${width}px /cart (with items): horizontal overflow ${overflow}px`);
    await ctx.close();
  }

  /* Product purchase CTAs must never wrap/clip their label at any width.
     The two primary buttons are full-width and stacked; the wishlist control
     becomes a fixed icon once there is room. `whitespace-nowrap` + the stacked
     layout guarantee a single line per label. */
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({
      viewport: { width, height: 900 },
      locale: "fa-IR",
    });
    const page = await ctx.newPage();
    await page.goto(BASE + "/product/ethiopia-yirgacheffe", { waitUntil: "networkidle" });
    const add = page.getByRole("button", { name: /افزودن به سبد خرید/ }).first();
    const quick = page.getByRole("button", { name: /خرید سریع/ }).first();
    for (const [label, btn] of [["افزودن به سبد خرید", add], ["خرید سریع", quick]]) {
      const h = await btn.evaluate((el) => ({
        h: el.getBoundingClientRect().height,
        line: getComputedStyle(el).lineHeight,
        text: el.innerText.trim(),
      })).catch(() => null);
      // h-13 = 52px; if the label wrapped the pill would grow past ~56px.
      if (!h) problems.push(`${width}px product CTA "${label}" not found`);
      else if (h.h > 58) problems.push(`${width}px product CTA "${label}" wrapped (${Math.round(h.h)}px)`);
    }
    await ctx.close();
  }

  await browser.close();
  if (problems.length) {
    console.log(problems.join("\n"));
    console.log(`\n${problems.length} problems`);
    process.exitCode = 1;
  } else {
    console.log(
      `CLEAN: ${PAGES.length} pages × ${WIDTHS.length} widths — no overflow, logo intact, mobile menu OK, no console errors`,
    );
  }
})();
