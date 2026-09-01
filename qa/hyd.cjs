const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch();
  for (const path of ["/", "/shop", "/product/ethiopia-yirgacheffe", "/cart", "/journal"]) {
    const p = await b.newPage();
    const msgs = [];
    p.on("console", (m) => { if (["error","warning"].includes(m.type())) msgs.push(m.type()+": "+m.text().slice(0,220)); });
    p.on("pageerror", (e) => msgs.push("pageerror: " + e.message.slice(0,220)));
    await p.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
    await p.waitForTimeout(1500);
    const badge = await p.locator('[data-nextjs-toast], nextjs-portal').count();
    console.log(path, "| msgs:", msgs.length ? msgs.join(" ~ ") : "none", "| devPortal:", badge);
    await p.close();
  }
  await b.close();
})();
