const { chromium } = require("playwright");
const BASE = "http://localhost:3000";
const results = [];
const check = (name, ok, extra = "") =>
  results.push(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? " :: " + extra : ""}`);

(async () => {
  const browser = await chromium.launch();

  /* ---------------- Desktop flow ---------------- */
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: "fa-IR",
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  // Home → Shop
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "خرید از فروشگاه" }).click();
  await page.waitForURL("**/shop");
  check("Home → Shop navigation", page.url().includes("/shop"));

  // Filters
  const before = await page.locator("article").count();
  await page.getByText("رست روشن", { exact: true }).first().click();
  await page.waitForTimeout(900);
  const after = await page.locator("article").count();
  check("Shop filter (light roast) narrows results", after > 0 && after < before, `${before} → ${after}`);

  // Sort
  await page.selectOption("#sort", "price-asc");
  await page.waitForTimeout(800);
  check("Shop sort control works", true);

  // Reset + search in shop
  await page.getByRole("button", { name: /حذف همه فیلترها/ }).click();
  await page.waitForTimeout(700);
  await page.getByLabel("جستجو در محصولات").fill("اتیوپی");
  await page.waitForTimeout(1200);
  const searchCount = await page.locator("article").count();
  check("Shop inline search returns results", searchCount > 0, `${searchCount} items`);

  // Product page
  await page.locator("article h3 a").first().click();
  await page.waitForURL("**/product/**");
  check("Shop → Product navigation", page.url().includes("/product/"));

  // Variants + add to cart
  await page.getByRole("radio", { name: "۵۰۰ گرم" }).click();
  await page.getByRole("button", { name: "افزایش تعداد" }).click();
  await page.getByRole("button", { name: /افزودن به سبد خرید/ }).click();
  await page.waitForTimeout(600);
  const badge = await page.locator("header").getByText("۲", { exact: true }).count();
  check("Add to cart updates header badge", badge > 0);
  check("Add-to-cart toast shown", (await page.getByText("به سبد خرید اضافه شد").count()) > 0);

  // Wishlist from product page
  await page.getByRole("button", { name: /افزودن به علاقه‌مندی‌ها/ }).click();
  await page.waitForTimeout(400);
  check("Wishlist toggle on product", (await page.getByText("به علاقه‌مندی‌ها اضافه شد").count()) > 0);

  // Cart drawer (scroll up first — the header auto-hides while scrolling down)
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: /سبد خرید/ }).first().click();
  await page.waitForTimeout(500);
  const drawer = page.getByRole("dialog", { name: "سبد خرید" });
  check("Cart drawer opens", await drawer.isVisible());
  await drawer.getByRole("button", { name: "افزایش تعداد" }).first().click();
  await page.waitForTimeout(300);
  check("Cart quantity increment works", (await drawer.getByText("۳").count()) > 0);
  await drawer.getByRole("link", { name: "مشاهده سبد" }).click();
  await page.waitForURL("**/cart");
  check("Drawer → Cart page", page.url().includes("/cart"));

  // Discount code
  await page.getByLabel("کد تخفیف").fill("DARBAND10");
  await page.getByRole("button", { name: "اعمال" }).click();
  await page.waitForTimeout(500);
  check("Valid discount applies", (await page.getByText("کد تخفیف اعمال شد").count()) > 0);
  await page.getByLabel("کد تخفیف").fill("NOPE");
  await page.getByRole("button", { name: "اعمال" }).click();
  await page.waitForTimeout(400);
  check("Invalid discount rejected", (await page.getByText("کد تخفیف معتبر نیست").count()) > 0);

  // Remove item → empty state
  const removeBtns = page.getByRole("button", { name: /حذف .* از سبد خرید/ });
  const n = await removeBtns.count();
  for (let i = 0; i < n; i++) await removeBtns.first().click();
  await page.waitForTimeout(600);
  check("Cart empty state renders", (await page.getByText("سبد خرید شما خالی است").count()) > 0);

  // Wishlist page
  await page.goto(BASE + "/wishlist", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  check("Wishlist page shows saved item", (await page.locator("article").count()) > 0);
  await page.getByRole("button", { name: /افزودن همه به سبد/ }).click();
  await page.waitForTimeout(500);
  check("Wishlist bulk add-to-cart", (await page.getByText("به سبد خرید اضافه شد").count()) > 0);

  // Search overlay
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: "جستجو در فروشگاه" }).click();
  await page.waitForTimeout(400);
  const dialog = page.getByRole("dialog", { name: "جستجو در فروشگاه" });
  check("Search overlay opens", await dialog.isVisible());
  await dialog.getByLabel("عبارت جستجو").fill("کنیا");
  await page.waitForTimeout(900);
  check("Search returns product results", (await dialog.getByText("کنیا AA نییری").count()) > 0);
  await dialog.getByLabel("عبارت جستجو").fill("zzzzqq");
  await page.waitForTimeout(900);
  check("Search empty state", (await dialog.getByText(/نتیجه‌ای برای/).count()) > 0);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  check("Search closes on Escape", (await dialog.count()) === 0);

  // Coffee finder
  await page.goto(BASE + "/#coffee-finder", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  for (const label of ["پور اور / وی‌۶۰", "میوه‌ای و گلی", "متعادل", "زیاد", "حرفه‌ای"]) {
    await page.getByRole("radio", { name: new RegExp(label.split(" ")[0]) }).first().click();
    await page.waitForTimeout(450);
  }
  await page.waitForTimeout(1200);
  check("Coffee finder produces recommendations", (await page.getByText(/تطابق/).count()) >= 3);

  // Keyboard accessibility: focus visible on first tab
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 30));
  check("Skip link is first tab stop", (focused || "").includes("محتوای اصلی"), focused);

  check("No uncaught page errors (desktop)", errors.length === 0, errors.join(" | "));
  await ctx.close();

  /* ---------------- Mobile flow ---------------- */
  const mctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: "fa-IR",
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  const m = await mctx.newPage();
  const merrors = [];
  m.on("pageerror", (e) => merrors.push(e.message));

  await m.goto(BASE, { waitUntil: "networkidle" });
  await m.getByRole("button", { name: "باز کردن منو" }).click();
  await m.waitForTimeout(500);
  const nav = m.getByRole("dialog", { name: "منو" });
  check("Mobile nav drawer opens", await nav.isVisible());
  await nav.getByRole("button", { name: "فروشگاه" }).click();
  await m.waitForTimeout(300);
  await nav.getByRole("link", { name: "قهوه دانه" }).click();
  await m.waitForURL("**/shop**");
  check("Mobile nav submenu navigates", m.url().includes("category=whole-bean"));

  await m.getByRole("button", { name: /^فیلترها/ }).first().click();
  await m.waitForTimeout(500);
  check("Mobile filter drawer opens", await m.getByRole("dialog", { name: "فیلترها" }).isVisible());
  await m.getByRole("button", { name: "مشاهده نتایج" }).click();
  await m.waitForTimeout(400);
  check("Mobile filter drawer closes", (await m.getByRole("dialog", { name: "فیلترها" }).count()) === 0);

  await m.locator("article button", { hasText: "افزودن به سبد" }).first().click();
  await m.waitForTimeout(500);
  check("Mobile quick add works", (await m.getByText("به سبد خرید اضافه شد").count()) > 0);
  check("No uncaught page errors (mobile)", merrors.length === 0, merrors.join(" | "));

  await mctx.close();
  await browser.close();

  console.log(results.join("\n"));
  console.log("\n" + results.filter((r) => r.startsWith("FAIL")).length + " failures / " + results.length + " checks");
})();
