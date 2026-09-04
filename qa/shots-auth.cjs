/** Screenshot helper for the auth + account screens (guest and signed-in). */
const { chromium } = require("playwright");
const BASE = "http://localhost:3000";
const SESSION = {
  id: "u-001", phone: "09121234567", phoneVerified: true,
  firstName: "سارا", lastName: "محمدی", email: "sara.mohammadi@example.com",
  birthDate: "1370-05-12", credit: 250000, loyaltyPoints: 1240,
  createdAt: "۱۴۰۲/۱۱/۰۳", acceptedTerms: true, newsletter: true,
};
const ACCOUNT = ["/account","/account/orders","/account/orders/DB-14040512","/account/profile","/account/addresses","/account/notifications","/account/wishlist"];

const shoot = async (p, file) => {
  await p.evaluate(() => document.querySelectorAll("img").forEach((i) => { i.loading = "eager"; }));
  await p.waitForTimeout(1000);
  await p.screenshot({ path: file, fullPage: true, type: "jpeg", quality: 76 });
};

(async () => {
  const b = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH });
  for (const [name, width, height] of [["desktop", 1280, 900], ["mobile", 390, 844]]) {
    /* Guest: auth + OTP */
    const guest = await b.newContext({ viewport: { width, height }, locale: "fa-IR", reducedMotion: "reduce" });
    const g = await guest.newPage();
    await g.goto(`${BASE}/auth`, { waitUntil: "networkidle" });
    await shoot(g, `qa/shot-auth-${name}.jpg`);
    await g.getByTestId("phone-input").fill("09121234567");
    await g.getByTestId("send-code").click();
    await g.waitForURL("**/verify**");
    await shoot(g, `qa/shot-verify-${name}.jpg`);
    await guest.close();

    /* Signed in: account pages */
    const c = await b.newContext({ viewport: { width, height }, locale: "fa-IR", reducedMotion: "reduce" });
    const p = await c.newPage();
    await p.goto(BASE, { waitUntil: "domcontentloaded" });
    await p.evaluate((s) => localStorage.setItem("darband.auth.session.v1", JSON.stringify(s)), SESSION);
    for (const route of ACCOUNT) {
      await p.goto(BASE + route, { waitUntil: "networkidle" });
      await shoot(p, `qa/shot${route.replace(/\//g, "_")}-${name}.jpg`);
    }
    await c.close();
  }
  await b.close();
  console.log("screenshots written to qa/");
})();
