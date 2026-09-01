const { chromium } = require("playwright");

const BASE = "http://localhost:3000";
const VIEWPORTS = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "desktop-1280", width: 1280, height: 900 },
];
const PAGES = [
  ["home", "/"],
  ["shop", "/shop"],
  ["product", "/product/ethiopia-yirgacheffe"],
  ["cart", "/cart"],
  ["wishlist", "/wishlist"],
  ["about", "/about"],
  ["journal", "/journal"],
  ["article", "/journal/art-of-pourover"],
];

(async () => {
  const browser = await chromium.launch();
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      locale: "fa-IR",
      reducedMotion: "reduce",
    });
    for (const [name, path] of PAGES) {
      const page = await ctx.newPage();
      await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 45000 });
      // Force every image to load eagerly so full-page shots aren't blank.
      await page.evaluate(() => {
        document.querySelectorAll("img").forEach((i) => {
          i.loading = "eager";
          i.fetchPriority = "high";
        });
      });
      await page
        .waitForFunction(() => Array.from(document.images).every((i) => i.complete), null, {
          timeout: 15000,
        })
        .catch(() => {});
      await page.waitForTimeout(400);
      await page.screenshot({
        path: `qa/${name}-${vp.name}.jpg`,
        fullPage: true,
        type: "jpeg",
        quality: 65,
      });
      console.log("shot", name, vp.name);
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
})();
