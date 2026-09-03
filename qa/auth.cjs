/**
 * QA — mobile OTP auth + customer account.
 * Requires the app running on http://localhost:3000 (production build).
 *   node qa/auth.cjs
 */
const { chromium } = require("playwright");

const BASE = "http://localhost:3000";
const OTP = "12345"; // mock code, mirrors MOCK_OTP_CODE in auth.service.ts
const EXISTING = "09121234567";
const NEW_USER = "09120000000";

const results = [];
const check = (name, ok, extra = "") =>
  results.push(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? " :: " + extra : ""}`);

const typeOtp = async (page, code) => {
  for (let i = 0; i < code.length; i++) {
    await page.getByTestId(`otp-${i}`).fill(code[i]);
  }
};

/** True when the element's text paints left-to-right (first char x < last x).
 *  Phone numbers are LTR content; inside RTL text they must be isolated with
 *  `dir="ltr"` or the bidi algorithm reverses the digit groups. */
const rendersLtr = async (page, selector) =>
  page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const t = el.textContent || "";
    const x = (ch) => {
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) {
        const i = n.textContent.indexOf(ch);
        if (i >= 0) {
          const r = document.createRange();
          r.setStart(n, i);
          r.setEnd(n, i + 1);
          return r.getBoundingClientRect().left;
        }
      }
      return null;
    };
    const f = x(t[0]);
    const l = x(t[t.length - 1]);
    if (f === null || l === null) return null;
    return f < l;
  }, selector);

(async () => {
  const browser = await chromium.launch();

  /* =========================== Desktop context =========================== */
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: "fa-IR",
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    const t = m.text();
    if (m.type() === "error" && !t.includes("404")) errors.push(`console: ${t}`);
  });

  /* 1. Guest hitting a protected route is redirected, target preserved */
  await page.goto(`${BASE}/account/orders`, { waitUntil: "networkidle" });
  await page.waitForURL("**/auth**", { timeout: 8000 });
  check(
    "Guest → /account/orders redirects to /auth with next",
    page.url().includes("/auth") && decodeURIComponent(page.url()).includes("next=/account/orders"),
    page.url().split("localhost:3000")[1],
  );

  /* 2. Invalid Iranian numbers are rejected */
  const invalids = [
    "0912123456", // too short
    "091212345678", // too long
    "02112345678", // landline prefix
    "abcdefghij", // letters only
    "+14155552671", // non-Iranian number
    "+-() ", // symbols only
    "", // empty
  ];
  let allRejected = true;
  const rejectedDetail = [];
  for (const value of invalids) {
    await page.getByTestId("phone-input").fill("");
    if (value) await page.getByTestId("phone-input").fill(value);
    await page.getByTestId("send-code").click();
    await page.waitForTimeout(150);
    const msg = await page.locator("#phone-error").innerText();
    if (!msg.includes("معتبر نیست") || page.url().includes("verify")) {
      allRejected = false;
      rejectedDetail.push(value || "(empty)");
    }
  }
  check(
    "Invalid phone numbers rejected with exact message",
    allRejected,
    rejectedDetail.join(", "),
  );

  /* 2b. Every accepted format normalises to the same canonical number.
        The masked phone is rendered from the canonical value, so identical
        masks prove identical canonicalisation. */
  const formats = [
    ["09121234567", "local 11-digit"],
    ["9121234567", "10-digit without leading zero"],
    ["+989121234567", "international +98"],
    ["00989121234567", "international 0098"],
    ["۰۹۱۲۱۲۳۴۵۶۷", "Persian digits"],
    ["\u0660\u0669\u0661\u0662\u0661\u0662\u0663\u0664\u0665\u0666\u0667", "Arabic-Indic digits"],
    ["0912 123 4567", "spaces"],
    ["0912-123-4567", "dashes"],
    ["(+98) 912 123 4567", "parentheses + international"],
  ];
  const masks = [];
  for (const [value, label] of formats) {
    await page.goto(`${BASE}/auth`, { waitUntil: "networkidle" });
    await page.getByTestId("phone-input").fill(value);
    await page.getByTestId("send-code").click();
    await page.waitForURL("**/auth/verify**", { timeout: 8000 });
    masks.push(`${label}=${(await page.getByTestId("masked-phone").innerText()).trim()}`);
  }
  const uniqueMasks = [...new Set(masks.map((m) => m.split("=")[1]))];
  check(
    "All accepted phone formats produce one canonical number",
    uniqueMasks.length === 1 && uniqueMasks[0].includes("۰۹۱۲") && uniqueMasks[0].includes("۴۵۶۷"),
    uniqueMasks.join(" | "),
  );

  /* 2c. The field shows the local form and never a decorative +98 prefix.
        `next` is restored here so the sign-in below still proves the
        originally requested page is preserved. */
  await page.goto(`${BASE}/auth?next=${encodeURIComponent("/account/orders")}`, {
    waitUntil: "networkidle",
  });
  await page.getByTestId("phone-input").fill("+989121234567");
  const shown = await page.getByTestId("phone-input").inputValue();
  check("Pasted +98 number is displayed locally as 09…", shown === "09121234567", shown);
  check("Phone input renders no +98 prefix decoration", !(await page.content()).includes("+۹۸"));

  /* 3. Pasting the international form signs the existing user in */
  await page.getByTestId("send-code").click();
  await page.waitForURL("**/auth/verify**", { timeout: 8000 });
  const masked = await page.getByTestId("masked-phone").innerText();
  check("Pasted +98 phone → OTP screen with masked number", masked.includes("۰۹۱۲"), masked);
  check(
    "OTP masked phone renders left-to-right (not reversed by RTL bidi)",
    (await rendersLtr(page, '[data-testid="masked-phone"]')) === true,
    masked,
  );

  /* 4. Wrong code → error, inputs cleared */
  await typeOtp(page, "11111");
  await page.waitForTimeout(1200);
  const wrongMsg = await page.getByTestId("otp-status").innerText();
  check("Wrong OTP shows an error", wrongMsg.includes("درست نیست"), wrongMsg.trim());

  /* 5. Resend countdown is visible, then resend works */
  const countdown = await page.getByTestId("resend-countdown").innerText();
  check("Resend countdown is running", /ثانیه/.test(countdown), countdown.trim());

  /* 6. Expired code (clock moved past TTL) */
  await page.evaluate(() => {
    const raw = sessionStorage.getItem("darband.auth.challenge.v1");
    if (raw) {
      const c = JSON.parse(raw);
      c.expiresAt = Date.now() - 1000;
      sessionStorage.setItem("darband.auth.challenge.v1", JSON.stringify(c));
    }
  });
  await typeOtp(page, OTP);
  await page.waitForTimeout(1200);
  const expiredMsg = await page.getByTestId("otp-status").innerText();
  check("Expired OTP shows the expiry error", expiredMsg.includes("منقضی"), expiredMsg.trim());

  /* 7. Resend after expiry, then the correct code signs the existing user in */
  await page.getByTestId("resend-code").click();
  await page.waitForTimeout(1400);
  await typeOtp(page, OTP);
  await page.waitForURL("**/account/orders", { timeout: 10000 });
  check(
    "Correct OTP → existing user returns to the originally requested page",
    page.url().endsWith("/account/orders"),
    page.url().split("localhost:3000")[1],
  );

  await page.goto(`${BASE}/account`, { waitUntil: "networkidle" });
  const welcome = await page.locator("h1").first().innerText();
  check("Dashboard greets the customer by name", welcome.includes("سارا"), welcome.trim());

  /* 8. Session survives a reload */
  await page.reload({ waitUntil: "networkidle" });
  check("Refresh keeps the mock session", page.url().endsWith("/account"));

  /* 9. Header account menu */
  await page.getByTestId("header-account-menu").click();
  await page.waitForTimeout(300);
  check(
    "Header shows the account menu when signed in",
    await page.getByRole("menu", { name: "منوی حساب کاربری" }).isVisible(),
  );
  await page.keyboard.press("Escape");

  /* 10. Orders list → filter → detail */
  await page.goto(`${BASE}/account/orders`, { waitUntil: "networkidle" });
  const orderCount = await page.locator('[data-testid="orders-list"] article').count();
  check("Orders list renders mock orders", orderCount >= 5, `${orderCount} orders`);

  await page.getByRole("button", { name: "تحویل‌شده" }).click();
  await page.waitForTimeout(900);
  const delivered = await page.locator('[data-testid="orders-list"] article').count();
  check("Order status filter narrows the list", delivered > 0 && delivered < orderCount, `${orderCount} → ${delivered}`);

  await page.getByRole("button", { name: "همه" }).click();
  await page.waitForTimeout(700);
  await page.getByTestId("order-search").fill("DB-14040512");
  await page.waitForTimeout(900);
  const searched = await page.locator('[data-testid="orders-list"] article').count();
  check("Order search by number works", searched === 1, `${searched} result`);

  await page.getByRole("link", { name: "جزئیات" }).first().click();
  await page.waitForURL("**/account/orders/DB-14040512");
  check("Order detail opens", (await page.locator("h1").innerText()).includes("DB-14040512"));

  /* 11. Reorder pushes items into the existing cart */
  await page.goto(`${BASE}/cart`, { waitUntil: "networkidle" });
  const cartBefore = await page.locator("body").innerText();
  await page.goto(`${BASE}/account/orders/DB-14040512`, { waitUntil: "networkidle" });
  await page.getByTestId("reorder").click();
  await page.waitForTimeout(800);
  await page.goto(`${BASE}/cart`, { waitUntil: "networkidle" });
  const cartAfter = await page.locator("body").innerText();
  check(
    "Reorder adds the order items to the cart",
    cartAfter.includes("اتیوپی یرگاچف") && cartAfter !== cartBefore,
  );

  /* 12. Unknown order id → not-found state */
  await page.goto(`${BASE}/account/orders/DB-0000`, { waitUntil: "networkidle" });
  const notFound = await page.locator("body").innerText();
  check(
    "Unknown order id shows a not-found state",
    notFound.includes("سفارش پیدا نشد") || notFound.includes("۴۰۴") || notFound.includes("404"),
  );

  /* 13. Profile edit */
  await page.goto(`${BASE}/account/profile`, { waitUntil: "networkidle" });
  await page.getByTestId("profile-first-name").fill("سارا");
  await page.getByTestId("save-profile").click();
  await page.waitForTimeout(900);
  check("Profile save shows a success toast", (await page.locator("body").innerText()).includes("تغییرات ذخیره شد"));

  /* Validation: empty name blocks saving */
  await page.getByTestId("profile-first-name").fill("");
  await page.getByTestId("save-profile").click();
  await page.waitForTimeout(300);
  check(
    "Profile validation blocks an empty name",
    (await page.locator("body").innerText()).includes("نام را وارد کنید"),
  );
  await page.getByTestId("profile-first-name").fill("سارا");
  await page.getByTestId("save-profile").click();
  await page.waitForTimeout(700);

  /* The verified number must read left-to-right, not reversed by RTL bidi */
  const profilePhoneLtr = await rendersLtr(page, '[data-testid="profile-phone"]');
  check(
    "Profile verified phone renders left-to-right",
    profilePhoneLtr === true,
    String(profilePhoneLtr),
  );

  /* 14. Addresses: add → edit → delete */
  await page.goto(`${BASE}/account/addresses`, { waitUntil: "networkidle" });
  const addrBefore = await page.locator('[data-testid="address-list"] li').count();

  await page.getByTestId("add-address").click();
  await page.waitForTimeout(400);
  await page.getByTestId("save-address").click(); // empty form
  await page.waitForTimeout(400);
  check(
    "Address form validates required fields",
    (await page.locator("body").innerText()).includes("عنوان نشانی را وارد کنید"),
  );

  await page.getByTestId("address-title").fill("خانه ییلاقی");
  await page.getByTestId("address-recipient").fill("سارا محمدی");
  await page.getByTestId("address-phone").fill("09121234567");
  await page.getByTestId("address-line").fill("بلوار امام رضا، کوچه دوم، ساختمان نگین");
  await page.getByTestId("address-plaque").fill("۷");
  await page.getByTestId("address-postal").fill("1234567890");
  await page.getByTestId("save-address").click();
  await page.waitForTimeout(1000);
  const addrAfter = await page.locator('[data-testid="address-list"] li').count();
  check("Add address works", addrAfter === addrBefore + 1, `${addrBefore} → ${addrAfter}`);

  await page.getByRole("button", { name: "ویرایش" }).last().click();
  await page.waitForTimeout(400);
  await page.getByTestId("address-title").fill("خانه ییلاقی ۲");
  await page.getByTestId("save-address").click();
  await page.waitForTimeout(900);
  check(
    "Edit address works",
    (await page.locator('[data-testid="address-list"]').innerText()).includes("خانه ییلاقی ۲"),
  );

  await page.getByRole("button", { name: /حذف نشانی خانه ییلاقی ۲/ }).click();
  await page.waitForTimeout(400);
  const dialogVisible = await page.getByRole("dialog", { name: "حذف نشانی" }).isVisible();
  await page.getByTestId("confirm-delete-address").click();
  await page.waitForTimeout(800);
  const addrFinal = await page.locator('[data-testid="address-list"] li').count();
  check("Delete address asks for confirmation and removes it", dialogVisible && addrFinal === addrBefore);

  /* 15. Notifications */
  await page.goto(`${BASE}/account/notifications`, { waitUntil: "networkidle" });
  const notifCount = await page.locator('[data-testid="notification-list"] li').count();
  check("Notifications render", notifCount >= 6, `${notifCount} items`);
  await page.getByTestId("mark-all-read").click();
  await page.waitForTimeout(700);
  check(
    "Mark all as read clears the unread badge",
    (await page.getByTestId("mark-all-read").count()) === 0,
  );
  await page.getByTestId("pref-offers").click();
  await page.waitForTimeout(300);
  check(
    "Notification preference toggles",
    (await page.getByTestId("pref-offers").getAttribute("aria-checked")) === "false",
  );

  /* 16. Wishlist inside the account, wired to the shared store */
  await page.goto(`${BASE}/product/ethiopia-yirgacheffe`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /افزودن به علاقه‌مندی‌ها|ذخیره در علاقه‌مندی/ }).first().click();
  await page.waitForTimeout(500);
  await page.goto(`${BASE}/account/wishlist`, { waitUntil: "networkidle" });
  const wishText = await page.locator("body").innerText();
  check("Account wishlist reflects the shared store", wishText.includes("اتیوپی یرگاچف"));
  await page.getByRole("button", { name: "افزودن همه به سبد" }).click();
  await page.waitForTimeout(700);
  check("Wishlist bulk add-to-cart works", (await page.locator("body").innerText()).includes("به سبد خرید اضافه شد"));

  /* 17. Logout blocks the protected route again, cart survives */
  await page.goto(`${BASE}/account`, { waitUntil: "networkidle" });
  await page.getByTestId("logout-desktop").click();
  await page.waitForURL("**/auth**", { timeout: 8000 });
  await page.goto(`${BASE}/account`, { waitUntil: "networkidle" });
  await page.waitForURL("**/auth**", { timeout: 8000 });
  check(
    "Logout blocks protected routes again",
    new URL(page.url()).pathname === "/auth",
    new URL(page.url()).pathname,
  );
  await page.goto(`${BASE}/cart`, { waitUntil: "networkidle" });
  check(
    "Cart survives logout",
    (await page.locator("body").innerText()).includes("اتیوپی یرگاچف"),
  );

  /* 18. New user → profile completion step */
  await page.goto(`${BASE}/auth`, { waitUntil: "networkidle" });
  await page.getByTestId("phone-input").fill(NEW_USER);
  await page.getByTestId("send-code").click();
  await page.waitForURL("**/auth/verify**");
  await typeOtp(page, OTP);
  await page.waitForTimeout(1400);
  const onProfileStep = await page.getByTestId("profile-form").isVisible();
  check("New user is asked to complete the profile", onProfileStep);

  await page.getByTestId("submit-profile").click();
  await page.waitForTimeout(400);
  check(
    "Profile step validates name + terms",
    (await page.locator("body").innerText()).includes("پذیرش قوانین الزامی است"),
  );

  /* Fix 1 regression: a refresh during registration must not fall back to OTP */
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  check(
    "Profile step survives a page refresh",
    await page.getByTestId("profile-form").isVisible(),
    page.url().split("localhost:3000")[1],
  );
  check(
    "Refreshed registration does not fall back to the OTP form",
    (await page.getByTestId("otp-0").count()) === 0,
  );

  /* …and /auth bounces a half-registered account back to the profile step */
  await page.goto(`${BASE}/auth`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  check(
    "Incomplete account visiting /auth is sent back to the profile step",
    new URL(page.url()).pathname === "/auth/verify" &&
      (await page.getByTestId("profile-form").isVisible()),
    page.url().split("localhost:3000")[1],
  );

  await page.getByTestId("first-name").fill("نگار");
  await page.getByTestId("last-name").fill("کیانی");
  await page.getByTestId("accept-terms").check();
  await page.getByTestId("submit-profile").click();
  await page.waitForURL("**/account", { timeout: 10000 });
  check(
    "New user finishes registration and enters the panel",
    (await page.locator("h1").first().innerText()).includes("نگار"),
  );

  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  check(
    "Session of the freshly registered user survives a refresh of /account",
    new URL(page.url()).pathname === "/account" &&
      (await page.locator("h1").first().innerText()).includes("نگار"),
  );

  /* 18b. Fix 3 regression: open-redirect targets are ignored */
  const redirectCases = [
    ["/account/orders", "/account/orders"],
    ["//example.com", "/account"],
    ["https://example.com", "/account"],
    ["javascript:alert(1)", "/account"],
    ["/%5cexample.com", "/account"],
    ["/account\\..\\evil", "/account"],
    ["data:text/html,<h1>x</h1>", "/account"],
  ];
  let redirectsSafe = true;
  const redirectDetail = [];
  for (const [target, expected] of redirectCases) {
    await page.goto(`${BASE}/auth?next=${encodeURIComponent(target)}`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(700); // signed in → the entry page redirects itself
    const url = new URL(page.url());
    if (url.origin !== BASE || url.pathname !== expected) {
      redirectsSafe = false;
      redirectDetail.push(`${target} → ${url.href}`);
    }
  }
  check("Safe redirect policy honours /account/* and blocks the rest", redirectsSafe,
    redirectDetail.join(" | "));

  /* 18c. …and the same policy applies to a full sign-in with a hostile next */
  await page.getByTestId("logout-desktop").click().catch(() => {});
  await page.waitForTimeout(600);
  await page.goto(`${BASE}/auth?next=${encodeURIComponent("//example.com")}`, {
    waitUntil: "networkidle",
  });
  await page.getByTestId("phone-input").fill(EXISTING);
  await page.getByTestId("send-code").click();
  await page.waitForURL("**/auth/verify**", { timeout: 8000 });
  await typeOtp(page, OTP);
  await page.waitForURL("**/account", { timeout: 10000 });
  check(
    "Sign-in with next=//example.com lands on /account, origin unchanged",
    new URL(page.url()).origin === BASE && new URL(page.url()).pathname === "/account",
    page.url(),
  );

  /* 19. Keyboard-only OTP flow */
  await page.getByTestId("logout-desktop").click();
  await page.waitForTimeout(900);
  await page.goto(`${BASE}/auth`, { waitUntil: "networkidle" });
  await page.getByTestId("phone-input").focus();
  await page.keyboard.type(EXISTING);
  await page.keyboard.press("Enter");
  await page.waitForURL("**/auth/verify**", { timeout: 8000 });
  await page.waitForTimeout(400);
  await page.keyboard.type(OTP); // relies on auto-focus + auto-advance
  await page.waitForURL("**/account", { timeout: 10000 });
  check("Keyboard-only OTP flow signs in", page.url().endsWith("/account"));

  /* 20. Paste support + backspace behaviour */
  await page.getByTestId("logout-desktop").click();
  await page.waitForTimeout(900);
  await page.goto(`${BASE}/auth`, { waitUntil: "networkidle" });
  await page.getByTestId("phone-input").fill(EXISTING);
  await page.getByTestId("send-code").click();
  await page.waitForURL("**/auth/verify**");
  await page.getByTestId("otp-0").focus();
  await page.evaluate((code) => {
    const input = document.querySelector('[data-testid="otp-0"]');
    const data = new DataTransfer();
    data.setData("text/plain", code);
    input.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true }));
  }, "1 2 3 4 5");
  await page.waitForURL("**/account", { timeout: 10000 });
  check("Pasting the full code verifies it", page.url().endsWith("/account"));

  check("No uncaught page errors (desktop)", errors.length === 0, errors.slice(0, 2).join(" | "));

  /* ============================ Mobile context ============================ */
  const mctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    locale: "fa-IR",
    reducedMotion: "reduce",
  });
  const m = await mctx.newPage();
  const mErrors = [];
  m.on("pageerror", (e) => mErrors.push(`pageerror: ${e.message}`));
  m.on("console", (e) => {
    if (e.type() === "error" && !e.text().includes("404")) mErrors.push(`console: ${e.text()}`);
  });

  await m.goto(BASE, { waitUntil: "networkidle" });
  await m.getByRole("button", { name: "باز کردن منو" }).click();
  await m.waitForTimeout(400);
  check("Mobile nav offers sign-in for guests", await m.getByTestId("mobile-nav-auth").isVisible());
  await m.getByTestId("mobile-nav-auth").click();
  await m.waitForURL("**/auth", { timeout: 8000 });

  await m.getByTestId("phone-input").fill(EXISTING);
  await m.getByTestId("send-code").click();
  await m.waitForURL("**/auth/verify**");
  await typeOtp(m, OTP);
  await m.waitForURL("**/account", { timeout: 10000 });
  check("Mobile sign-in works", m.url().endsWith("/account"));

  await m.getByRole("link", { name: "سفارش‌های من" }).first().click();
  await m.waitForURL("**/account/orders");
  check("Mobile account navigation (chip rail) works", m.url().includes("/account/orders"));

  await m.goto(`${BASE}/account/addresses`, { waitUntil: "networkidle" });
  await m.getByTestId("add-address").click();
  await m.waitForTimeout(500);
  const drawerUsable = await m.getByTestId("address-title").isVisible();
  const saveVisible = await m.getByTestId("save-address").isVisible();
  check("Address drawer is usable on mobile", drawerUsable && saveVisible);
  await m.keyboard.press("Escape");

  await m.getByTestId("logout-mobile").click();
  await m.waitForTimeout(1200);
  check("Mobile logout works", new URL(m.url()).pathname === "/auth", new URL(m.url()).pathname);

  check("No uncaught page errors (mobile)", mErrors.length === 0, mErrors.slice(0, 2).join(" | "));

  /* ===================== Responsive sweep (signed in) ===================== */
  const ROUTES = [
    "/auth",
    "/auth/verify",
    "/account",
    "/account/orders",
    "/account/orders/DB-14040512",
    "/account/profile",
    "/account/addresses",
    "/account/wishlist",
    "/account/notifications",
  ];
  const VIEWPORTS = [375, 390, 768, 1024, 1280, 1440];
  const overflow = [];

  for (const width of VIEWPORTS) {
    const c = await browser.newContext({
      viewport: { width, height: 900 },
      locale: "fa-IR",
      reducedMotion: "reduce",
    });
    const p = await c.newPage();
    await p.goto(BASE, { waitUntil: "domcontentloaded" });
    /* Seed the mock session so protected routes render instead of redirecting. */
    await p.evaluate(() => {
      localStorage.setItem(
        "darband.auth.session.v1",
        JSON.stringify({
          id: "u-001",
          phone: "09121234567",
          phoneVerified: true,
          firstName: "سارا",
          lastName: "محمدی",
          email: "sara.mohammadi@example.com",
          birthDate: "1370-05-12",
          credit: 250000,
          loyaltyPoints: 1240,
          createdAt: "۱۴۰۲/۱۱/۰۳",
          acceptedTerms: true,
          newsletter: true,
        }),
      );
    });

    for (const route of ROUTES) {
      await p.goto(BASE + route, { waitUntil: "domcontentloaded" });
      await p.waitForTimeout(600);
      const r = await p.evaluate(() => {
        const de = document.documentElement;
        return { s: de.scrollWidth, c: de.clientWidth };
      });
      if (r.s > r.c + 1) overflow.push(`${width}px ${route} (${r.s}>${r.c})`);
    }
    await c.close();
  }
  check("No horizontal overflow on auth/account at 6 breakpoints", overflow.length === 0, overflow.join(", "));

  await browser.close();

  console.log(results.join("\n"));
  const failures = results.filter((r) => r.startsWith("FAIL")).length;
  console.log(`\n${failures} failures / ${results.length} checks`);
  process.exit(failures ? 1 : 0);
})();
