/**
 * Pack Next.js standalone cho Windows Plesk (Windows + Linux CI).
 * Usage: node scripts/pack-plesk.mjs
 */
import { existsSync, cpSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: opts.cwd ?? root,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log("==> npm ci");
if (existsSync(join(root, "package-lock.json"))) {
  run("npm", ["ci"]);
} else {
  run("npm", ["install"]);
}

console.log("==> npm run build");
run("npm", ["run", "build"]);

const standalone = join(root, ".next", "standalone");
if (!existsSync(join(standalone, "server.js"))) {
  console.error("Build failed: missing .next/standalone/server.js");
  process.exit(1);
}

console.log("==> Copy .next/static + public vào standalone");
mkdirSync(join(standalone, ".next"), { recursive: true });
const staticDest = join(standalone, ".next", "static");
rmSync(staticDest, { recursive: true, force: true });
cpSync(join(root, ".next", "static"), staticDest, { recursive: true });

const publicSrc = join(root, "public");
if (existsSync(publicSrc)) {
  const publicDest = join(standalone, "public");
  rmSync(publicDest, { recursive: true, force: true });
  cpSync(publicSrc, publicDest, { recursive: true });
}

console.log("==> Stage deploy package");
const stage = join(root, ".plesk-stage");
const outZip = join(root, "plesk-deploy.zip");
rmSync(stage, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });

for (const file of ["main.js", "web.config", "package.json", ".env.example"]) {
  cpSync(join(root, file), join(stage, file));
}
mkdirSync(join(stage, ".next"), { recursive: true });
cpSync(standalone, join(stage, ".next", "standalone"), { recursive: true });

rmSync(outZip, { force: true });

if (process.platform === "win32") {
  const ps = `Compress-Archive -Path '${stage}\\*' -DestinationPath '${outZip}' -Force`;
  run("powershell", ["-NoProfile", "-Command", ps]);
} else {
  run("zip", ["-r", outZip, "."], { cwd: stage });
}

rmSync(stage, { recursive: true, force: true });

console.log("");
console.log(`OK: ${outZip}`);
console.log("Plesk Startup File = main.js | PORT=3303 | Node 20");
