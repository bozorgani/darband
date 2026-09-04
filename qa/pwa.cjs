/* Production integration QA. Isolated reverse proxy serves two real worker versions.
   Nothing in the application is changed to simulate updates or private responses. */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const widths = [320,360,375,390,412,768,1024,1280,1440];
let browser, proxy, revision=1, count=0, networkOffline=false;
function check(name, ok, detail="") { console.log((ok?"PASS ":"FAIL ")+name+" "+detail); if(!ok) throw Error(name); count++; }
const delay=(ms)=>new Promise(r=>setTimeout(r,ms));
async function entries(page) {
  return page.evaluate(async()=>{
    const out=[];
    for(const name of await caches.keys()) if(name.startsWith("ghahvino-pwa-")){
      const cache=await caches.open(name);
      for(const request of await cache.keys()){
        const response=await cache.match(request);
        out.push({name,url:request.url,body:response.headers.get("content-type")?.includes("text/html")?await response.text():""});
      }
    }
    return out;
  });
}
(async()=>{
  proxy=http.createServer((req,res)=>{
    if(networkOffline){req.socket.destroy();return;}
    if(req.url.startsWith("/api/qa")){res.writeHead(200,{"content-type":"application/json","cache-control":"no-store"});return res.end('{"probe":"PRIVATE_QA_SECRET"}');}
    if(["/product/qa-private","/product/qa-no-store"].includes(req.url)){
      res.writeHead(200,{"content-type":"text/html","cache-control":req.url.endsWith("private")?"private, max-age=3600":"no-store"});return res.end("<h1>PRIVATE_QA_SECRET</h1>");
    }
    if(req.url==="/product/qa-redirect"){res.writeHead(302,{location:"/auth"});return res.end();}
    const upstream=http.request({hostname:"localhost",port:3000,path:req.url,method:req.method,headers:{...req.headers,host:"localhost:3000","accept-encoding":"identity"}},response=>{
      if(req.url.startsWith("/sw.js")){
        const chunks=[];response.on("data",c=>chunks.push(c));response.on("end",()=>{
          const body=Buffer.concat(chunks).toString().replace(/const VERSION = "([^"]+)";/,(_,v)=>'const VERSION = "'+v+'-qa'+revision+'";');
          const headers={...response.headers};delete headers["content-length"];delete headers.etag;
          res.writeHead(response.statusCode,headers);res.end(body);
        });
      }else{res.writeHead(response.statusCode,response.headers);response.pipe(res);}
    });
    upstream.on("error",()=>{res.writeHead(502);res.end();});req.pipe(upstream);
  });
  await new Promise(r=>proxy.listen(0,"127.0.0.1",r));
  const BASE="http://127.0.0.1:"+proxy.address().port;
  browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});
  const ctx=await browser.newContext({locale:"fa-IR",viewport:{width:390,height:844}});
  const page=await ctx.newPage(), errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  const mr=await ctx.request.get(BASE+"/manifest.webmanifest"),m=await mr.json();
  check("Manifest identity/scope",mr.status()===200&&m.name==="قهوینو"&&m.lang==="fa-IR"&&m.dir==="rtl"&&m.scope==="/"&&m.id==="/"&&m.start_url==="/"&&m.display==="standalone");
  for(const purpose of ["any","maskable"])for(const size of [192,512]){
    const icon=m.icons.find(i=>i.purpose===purpose&&i.sizes===size+"x"+size);check("Icon declared "+purpose+size,!!icon);
    const response=await ctx.request.get(BASE+icon.src),bytes=await response.body();
    check("PNG MIME/dimensions "+icon.src,response.status()===200&&response.headers()["content-type"].includes("image/png")&&bytes.readUInt32BE(16)===size&&bytes.readUInt32BE(20)===size);
  }
  const apple=await ctx.request.get(BASE+"/apple-touch-icon.png");
  check("Apple 180px",apple.status()===200&&(await apple.body()).readUInt32BE(16)===180);
  const sw=await ctx.request.get(BASE+"/sw.js");
  check("SW JavaScript/no-store",sw.status()===200&&sw.headers()["content-type"].includes("javascript")&&sw.headers()["cache-control"].includes("no-store"));
  await page.goto(BASE,{waitUntil:"networkidle"});
  check("No duplicate automatic favicon metadata",await page.locator('link[rel="icon"]').evaluateAll(links=>links.filter(link=>new URL(link.href).pathname==="/favicon.ico").length===1));
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:25000});
  check("Real SW root scope",await page.evaluate(async()=>(await navigator.serviceWorker.ready).scope===location.origin+"/"));
  // Incognito contexts cannot install apps; use an isolated temporary regular profile.
  const regular=await chromium.launchPersistentContext("",{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});
  try {
    const probe=await regular.newPage();await probe.goto(BASE,{waitUntil:"networkidle"});
    await probe.waitForFunction(()=>!!navigator.serviceWorker.controller);
    const cdp=await regular.newCDPSession(probe);await cdp.send("Page.enable");
    const installability=await cdp.send("Page.getInstallabilityErrors");
    check("Chromium installability",installability.installabilityErrors.length===0,JSON.stringify(installability));
  } finally { await regular.close(); }
  await page.goto(BASE+"/shop",{waitUntil:"networkidle"});await delay(500);
  networkOffline=true;await ctx.setOffline(true);await page.goto(BASE+"/shop",{waitUntil:"domcontentloaded"});
  check("Public cached HTML offline",!(await page.locator("h1").innerText()).includes("اتصال اینترنت"));
  const fallback=await page.goto(BASE+"/never-visited-offline",{waitUntil:"domcontentloaded"});
  check("Unknown offline URL gets 503 fallback",fallback.status()===503&&await page.getByText("اتصال اینترنت در دسترس نیست",{exact:true}).isVisible(),JSON.stringify({status:fallback.status(),worker:fallback.fromServiceWorker(),heading:await page.locator("h1").allTextContents()}));
  check("Offline noindex/no canonical",/noindex/.test(await page.locator('meta[name="robots"]').getAttribute("content"))&&await page.locator('link[rel="canonical"]').count()===0);
  networkOffline=false;await ctx.setOffline(false);
  check("Offline excluded sitemap",!(await(await ctx.request.get(BASE+"/sitemap.xml")).text()).includes("/offline"));
  for(const route of ["/product/qa-no-store","/product/qa-private","/product/qa-redirect","/auth","/auth/verify","/account","/account/profile","/cart","/wishlist"])await page.goto(BASE+route,{waitUntil:"domcontentloaded"});
  await page.evaluate(async()=>{for(const method of ["GET","POST","PUT","PATCH","DELETE","OPTIONS"])await fetch("/api/qa",{method});});
  const cached=await entries(page);
  check("Real entries exclude private/API/redirect/mutations",!cached.some(e=>/^\/(auth|account|cart|wishlist|api|checkout|payment)(\/|$)/.test(new URL(e.url).pathname)||/qa-private|qa-no-store|qa-redirect/.test(e.url)));
  check("Cached HTML has no private fixture body",!cached.some(e=>e.body.includes("PRIVATE_QA_SECRET")));
  await page.goto(BASE,{waitUntil:"networkidle"});
  await page.evaluate(async()=>{
    for(const name of await caches.keys())if(name.includes("-pages-"))await(await caches.open(name)).put("/shop",new Response("<h1>EXPIRED_QA_MARKER</h1>",{headers:{"content-type":"text/html","x-ghahvino-cached-at":"1"}}));
    await caches.open("ghahvino-pwa-pages-obsolete");await caches.open("unrelated-cache-preserve");
  });
  networkOffline=true;await ctx.setOffline(true);await page.goto(BASE+"/shop");
  check("Expired cached HTML rejected",!(await page.content()).includes("EXPIRED_QA_MARKER")&&await page.getByText("اتصال اینترنت در دسترس نیست",{exact:true}).isVisible());
  networkOffline=false;await ctx.setOffline(false);await page.goto(BASE,{waitUntil:"networkidle"});
  revision=2;await page.evaluate(async()=>(await navigator.serviceWorker.ready).update());
  await page.getByTestId("pwa-update-prompt").waitFor({timeout:30000});
  check("Update dismiss button has contrasting surface",await page.getByTestId("pwa-update-prompt").getByRole("button",{name:"بعداً",exact:true}).evaluate(el=>{const s=getComputedStyle(el);const bg=s.backgroundColor==="rgba(0, 0, 0, 0)"?getComputedStyle(el.closest("aside")).backgroundColor:s.backgroundColor;return s.color!==bg;}));
  // Next hydration can emit same-document history events; count document requests only.
  let reloads=0;page.on("request",request=>{if(request.isNavigationRequest()&&request.frame()===page.mainFrame())reloads++;});
  await delay(1500);
  check("Waiting worker never reloads without consent",reloads===0&&await page.evaluate(async()=>!!(await navigator.serviceWorker.ready).waiting));
  for(const width of widths){await page.setViewportSize({width,height:900});check("Update bounds "+width,await page.getByTestId("pwa-update-prompt").evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;}));}
  const art=process.env.PWA_ARTIFACT_DIR;if(art){fs.mkdirSync(art,{recursive:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(art,"update.png")});}
  await Promise.all([page.waitForNavigation({waitUntil:"networkidle"}),page.getByRole("button",{name:"به‌روزرسانی",exact:true}).click()]);
  await delay(1500);check("Consent activates and reloads exactly once",reloads===1,String(reloads));
  const names=await page.evaluate(()=>caches.keys());
  check("Cleanup scoped to owned old caches",!names.includes("ghahvino-pwa-pages-obsolete")&&names.includes("unrelated-cache-preserve")&&names.filter(n=>n.startsWith("ghahvino-pwa-")).every(n=>n.endsWith("-qa2")));
  check("Update prompt does not loop",await page.getByTestId("pwa-update-prompt").count()===0);
  await page.evaluate(()=>{const e=new Event("beforeinstallprompt",{cancelable:true});Object.defineProperties(e,{prompt:{value:async()=>{}},userChoice:{value:Promise.resolve({outcome:"dismissed"})}});dispatchEvent(e);});
  check("Install not immediate",await page.getByTestId("pwa-install-cta").count()===0);
  await page.getByTestId("pwa-install-cta").waitFor({timeout:12000});
  for(const width of widths){await page.setViewportSize({width,height:900});check("Install bounds "+width,await page.getByTestId("pwa-install-cta").evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;}));}
  await page.getByTestId("pwa-install-cta").getByRole("button",{name:"بعداً",exact:true}).last().click();
  check("Dismiss remembered",await page.evaluate(()=>sessionStorage.getItem("ghahvino.pwa.install-dismissed.v1")==="1"));
  await page.goto(BASE+"/offline",{waitUntil:"networkidle"});
  for(const width of widths){await page.setViewportSize({width,height:900});check("Offline overflow "+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  if(art){await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(art,"offline.png"),fullPage:true});}
  check("No page/hydration errors",errors.length===0,errors.join("|"));await ctx.close();
  const ios=await browser.newContext({viewport:{width:390,height:844},userAgent:"Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1"});
  const ip=await ios.newPage();await ip.goto(BASE,{waitUntil:"networkidle"});
  await ip.getByTestId("pwa-ios-install-cta").getByRole("button",{name:"نمایش راهنما"}).click({timeout:12000});
  const dialog=ip.getByRole("dialog");check("Visible iOS CTA opens guide",(await dialog.innerText()).includes("Add to Home Screen"));
  for(const width of widths){await ip.setViewportSize({width,height:900});check("iOS bounds "+width,await dialog.evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;}));}
  if(art){await ip.setViewportSize({width:390,height:844});await ip.screenshot({path:path.join(art,"ios.png")});}
  await ip.keyboard.press("Escape");check("Dialog Escape works",await dialog.count()===0);await ios.close();
  const standalone=await browser.newContext();await standalone.addInitScript(()=>Object.defineProperty(navigator,"standalone",{get:()=>true}));
  const sp=await standalone.newPage();await sp.goto(BASE,{waitUntil:"networkidle"});await sp.evaluate(()=>dispatchEvent(new Event("beforeinstallprompt")));await delay(8500);
  check("Standalone hides install UI",await sp.getByTestId("pwa-install-cta").count()===0&&await sp.getByTestId("pwa-ios-install-cta").count()===0);
  await standalone.close();
  const overlay=await browser.newContext();
  // CDP cannot emulate installed display-mode here. Test detection with an explicit
  // MediaQueryList fixture; this is not an OS-installed window certification.
  await overlay.addInitScript(()=>{
    const original=window.matchMedia.bind(window);
    window.matchMedia=query=>{const result=original(query);if(query.includes("display-mode: window-controls-overlay"))Object.defineProperty(result,"matches",{value:true});return result;};
  });
  const op=await overlay.newPage();
  await op.goto(BASE,{waitUntil:"networkidle"});
  check("Desktop display-mode detection fixture",await op.evaluate(()=>matchMedia("(display-mode: window-controls-overlay)").matches));
  await op.evaluate(()=>dispatchEvent(new Event("beforeinstallprompt")));await delay(8500);
  check("Window-controls-overlay hides install UI",await op.getByTestId("pwa-install-cta").count()===0);
  await overlay.close();
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{
  await browser?.close();
  if(proxy){proxy.closeAllConnections();await new Promise(r=>proxy.close(r));}
  console.log(count+" checks passed; exit="+(process.exitCode||0));
});
