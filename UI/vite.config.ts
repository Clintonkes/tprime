// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // No route in this app uses server-side data (loaders/server functions), so the build
  // (see scripts/prerender-static.mjs) snapshots each route to static HTML instead of
  // running a live Node SSR server in production — FastAPI serves the result as static
  // files alongside the API. TanStack Start's own built-in prerender/crawler is not used
  // here: it depends on a preview-server code path (dist/server/server.js) that doesn't
  // match this project's pinned Nitro beta's actual output layout (.output/server/index.mjs),
  // so it 500s on every route.
  nitro: { preset: "node-server" },
});
