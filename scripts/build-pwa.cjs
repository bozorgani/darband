/* Manual SW packaging, independent of webpack/Turbopack. No third-party dependency. */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const result = spawnSync(process.execPath, [require.resolve("next/dist/bin/next"), "build"], { cwd: root, stdio: "inherit" });
if (result.status !== 0) process.exit(result.status || 1);
const source = fs.readFileSync(path.join(root, "src/pwa/worker.js"), "utf8");
const buildId = fs.readFileSync(path.join(root, ".next/BUILD_ID"), "utf8").trim();
const version = crypto.createHash("sha256").update(buildId).update(source).digest("hex").slice(0, 16);
fs.writeFileSync(path.join(root, "public/sw.js"), source.replace("__BUILD_VERSION__", version));
console.log("PWA worker packaged for deployment " + version);

