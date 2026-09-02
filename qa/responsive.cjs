/**
 * QA — post-rebrand responsive sweep (header/footer/logo/typography).
 * Requires the production build running on http://localhost:3000
 *   node qa/responsive.cjs
 */
const { chromium } = require("playwright");

const BASE = "http://localhost:3000";
const WIDTHS = [320, 360, 375, 390, 412, 768, 1024, 1280, 1440];
const PAGES = ["/", "/shop", "/product/ethiopia-yirgacheffe", "/journal", "/about", "/auth", "/account"];

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
  const browser = await chromium.launch();

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
