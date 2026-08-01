/**
 * Entry cho Plesk Node.js / Windows (Node 20).
 * Chạy sau `npm run build` (output: standalone).
 *
 * Plesk → Node.js version: 20.x
 * Plesk → Application Startup File: main.js
 */
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const PORT = process.env.PORT || "3000";
const HOSTNAME = process.env.HOSTNAME || "0.0.0.0";

process.env.PORT = String(PORT);
process.env.HOSTNAME = HOSTNAME;
process.env.NODE_ENV = process.env.NODE_ENV || "production";

const standaloneServer = path.join(__dirname, ".next", "standalone", "server.js");

if (!fs.existsSync(standaloneServer)) {
  console.error(
    "[main] Chưa có .next/standalone/server.js. Chạy: npm run build"
  );
  process.exit(1);
}

const standaloneDir = path.join(__dirname, ".next", "standalone");

console.log(`[main] Starting Next.js on ${HOSTNAME}:${PORT}`);
console.log(`[main] cwd=${standaloneDir}`);

const child = spawn(process.execPath, ["server.js"], {
  cwd: standaloneDir,
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`[main] exited by signal ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 0);
});

function shutdown() {
  if (!child.killed) child.kill("SIGTERM");
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
