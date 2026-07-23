// Snapshots each route to static HTML by briefly running the real built server and
// curling it, then writes the result into .output/public so it can be served as plain
// static files. See the comment in vite.config.ts for why this exists instead of using
// TanStack Start's built-in prerenderer.
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, ".output/public");
const serverEntry = path.join(rootDir, ".output/server/index.mjs");

const ROUTES = ["", "services", "book", "contact", "admin"];
const PORT = 41823;
const HOST = "127.0.0.1";
const BASE_URL = `http://${HOST}:${PORT}`;

async function waitForServer(timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE_URL}/`);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Server did not become ready within ${timeoutMs}ms`);
}

async function main() {
  const server = spawn(process.execPath, [serverEntry], {
    env: { ...process.env, PORT: String(PORT), HOST },
    stdio: "inherit",
  });

  let serverExited = false;
  server.on("exit", () => { serverExited = true; });

  try {
    await waitForServer();

    for (const route of ROUTES) {
      const res = await fetch(`${BASE_URL}/${route}`);
      if (!res.ok) {
        throw new Error(`Failed to snapshot /${route}: HTTP ${res.status}`);
      }
      const html = await res.text();
      const outDir = route ? path.join(publicDir, route) : publicDir;
      await mkdir(outDir, { recursive: true });
      await writeFile(path.join(outDir, "index.html"), html, "utf8");
      console.log(`[prerender-static] snapshotted /${route} -> ${path.relative(rootDir, outDir)}/index.html`);
    }
  } finally {
    if (!serverExited) server.kill();
  }
}

main().catch((err) => {
  console.error("[prerender-static] failed:", err);
  process.exit(1);
});
