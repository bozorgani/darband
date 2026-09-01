const { chromium } = require("playwright");
const VP=[[375,812],[390,844],[768,1024],[1024,768],[1280,900],[1440,960]];
const PAGES=["/","/shop","/product/ethiopia-yirgacheffe","/product/manual-grinder-pro","/cart","/wishlist","/about","/journal","/journal/art-of-pourover","/faq","/contact","/nope-404"];
(async()=>{const b=await chromium.launch();const out=[];
for(const [w,h] of VP){const c=await b.newContext({viewport:{width:w,height:h},locale:"fa-IR",reducedMotion:"reduce"});
for(const path of PAGES){const p=await c.newPage();const errs=[];
p.on("pageerror",e=>errs.push("pageerror "+e.message));
p.on("console",m=>{if(m.type()==="error"&&!m.text().includes("404"))errs.push("console "+m.text().slice(0,150))});
await p.goto("http://localhost:3000"+path,{waitUntil:"domcontentloaded"});
await p.waitForTimeout(700);
const r=await p.evaluate(()=>{const de=document.documentElement;const bad=[];
 if(de.scrollWidth>de.clientWidth+1){document.querySelectorAll("*").forEach(el=>{const b=el.getBoundingClientRect();
  if((b.right>de.clientWidth+2||b.left<-2)&&b.width>4&&b.height>4)bad.push(el.tagName+"."+String(el.className).slice(0,40));});}
 return {s:de.scrollWidth,c:de.clientWidth,bad:bad.slice(0,4)};});
if(r.s>r.c+1)out.push(`OVERFLOW ${w}px ${path} ${r.s}>${r.c} ${r.bad.join("|")}`);
if(errs.length)out.push(`ERR ${w}px ${path} :: ${errs.slice(0,2).join(" ~ ")}`);
await p.close();}
await c.close();}
await b.close();console.log(out.length?out.join("\n"):"CLEAN: no overflow, no console errors");})();
