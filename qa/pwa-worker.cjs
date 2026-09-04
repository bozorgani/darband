/* Deterministic contract tests against the actual worker source, no production hooks. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const origin = "https://ghahvino.test";
const memory = new Map(), handlers = {};
const key = value => new URL(typeof value === "string" ? value : value.url, origin).href;
const caches = {
  keys: async () => [...memory.keys()],
  delete: async name => memory.delete(name),
  open: async name => {
    if (!memory.has(name)) memory.set(name, new Map());
    const data = memory.get(name);
    return {
      keys: async () => [...data.keys()].map(url => new Request(url)),
      match: async request => data.get(key(request))?.clone(),
      put: async (request, response) => data.set(key(request), response.clone()),
      delete: async request => data.delete(key(request)),
    };
  },
};
let fetched, skipCount = 0;
const sandbox = { URL, Request, Response, Headers, AbortController, setTimeout, clearTimeout, caches,
  self: { location: { origin }, addEventListener: (name, fn) => { handlers[name] = fn; },
    registration: {}, clients: { claim: async () => {} }, skipWaiting: async () => { skipCount++; } },
  fetch: async (request, options) => { fetched = { request, options }; return new Response("ok"); },
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname,"../src/pwa/worker.js"),"utf8") +
  "\nthis.api = { put, read, cacheable, privateRequest, imageAllowed, publicFetch, CACHES, POLICIES };", sandbox);
const { api } = sandbox;
let count=0;
async function test(name, run) { await run(); count++; console.log("PASS " + name); }
(async () => {
  await test("All private roots and descendants bypass worker", () => {
    for (const root of ["auth","account","cart","wishlist","checkout","payment","api"])
      for (const suffix of ["","/","/secret?otp=12345"]) {
        let handled=false;handlers.fetch({request:new Request(origin+"/"+root+suffix),respondWith:()=>{handled=true;}});assert.equal(handled,false);
      }
  });
  await test("Mutation, Authorization, RSC and no-store requests bypass worker", () => {
    for (const options of [
      ...["POST","PUT","PATCH","DELETE","OPTIONS"].map(method=>({method})),
      ...[{authorization:"Bearer secret"},{rsc:"1"},{"next-router-prefetch":"1"},{"cache-control":"no-store"}].map(headers=>({headers})),
    ]) {let handled=false;handlers.fetch({request:new Request(origin+"/_next/static/probe.js",options),respondWith:()=>{handled=true;}});assert.equal(handled,false);}
  });
  await test("Private, no-store, Vary, Set-Cookie and error responses refused", async () => {
    const variants = [
      {headers:{"cache-control":"private"}}, {headers:{"cache-control":"no-store"}},
      {headers:{"set-cookie":"session=secret"}}, ...["Cookie","Authorization","*"].map(vary=>({headers:{vary}})),
      ...[301,302,401,404,500].map(status=>({status})),
    ];
    for (const [i, options] of variants.entries()) {
      await api.put("pages","/product/private-"+i,new Response("SECRET",{...options,headers:{"content-type":"text/html",...options.headers}}));
      assert.equal(await api.read("pages","/product/private-"+i),undefined);
    }
  });
  await test("Concurrent writes enforce all runtime entry bounds", async () => {
    for(const kind of ["pages","static","images","fonts"]){
      await Promise.all(Array.from({length:api.POLICIES[kind].entries+9},(_,i)=>api.put(kind,"/probe/"+kind+i,new Response("ok",{headers:{"content-type":kind==="pages"?"text/html":kind==="images"?"image/png":"application/octet-stream"}}))));
      assert.equal((await(await caches.open(api.CACHES[kind])).keys()).length,api.POLICIES[kind].entries);
    }
  });
  await test("Expired entries are removed and oversized bodies rejected", async () => {
    const cache=await caches.open(api.CACHES.pages);
    await cache.put("/expired",new Response("old",{headers:{"x-ghahvino-cached-at":"1"}}));
    assert.equal(await api.read("pages","/expired"),undefined);assert.equal(await cache.match("/expired"),undefined);
    await api.put("pages","/too-large",new Response("x".repeat(api.POLICIES.pages.bytes+1),{headers:{"content-type":"text/html"}}));
    assert.equal(await cache.match("/too-large"),undefined);
  });
  await test("Public fetch omits credentials", async () => {
    await api.publicFetch(origin+"/shop");assert.equal(fetched.options.credentials,"omit");
  });
  await test("Incomplete offline shell rejects installation without activation", async () => {
    let operation;handlers.install({waitUntil:p=>{operation=p;}});
    await assert.rejects(operation,/Offline shell unavailable/);assert.equal(skipCount,0);
  });
  await test("Image optimizer excludes external/private sources", () => {
    for(const source of ["https://evil.test/image.png","/account/avatar","/api/image"])
      assert.equal(api.imageAllowed(new URL(origin+"/_next/image?url="+encodeURIComponent(source))),false);
    assert.equal(api.imageAllowed(new URL(origin+"/_next/image?url=%2Fimages%2Fcoffee.jpg")),true);
  });
  await test("Activation cleanup preserves unrelated caches", async () => {
    await caches.open("ghahvino-pwa-old");await caches.open("another-app");let operation;
    handlers.activate({waitUntil:p=>{operation=p;}});await operation;
    assert.equal(memory.has("ghahvino-pwa-old"),false);assert.equal(memory.has("another-app"),true);
    assert.equal(skipCount,0);
  });
  await test("Only same-origin explicit update messages activate waiting worker", async () => {
    let operation;handlers.message({source:{url:"https://evil.test/"},data:{type:"SKIP_WAITING"},waitUntil:p=>{operation=p;}});assert.equal(skipCount,0);
    handlers.message({source:{url:origin+"/"},data:{type:"SKIP_WAITING"},waitUntil:p=>{operation=p;}});await operation;assert.equal(skipCount,1);
  });
  console.log(count+" worker contracts passed");
})().catch(error=>{console.error(error);process.exitCode=1;});
