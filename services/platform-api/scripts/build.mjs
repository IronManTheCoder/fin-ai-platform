import { build } from "esbuild";
import { rmSync, mkdirSync } from "node:fs";

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });

await build({
  entryPoints: ["src/handler.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",              // Lambda prefers CJS handler unless you use ES module handler config
  outfile: "dist/index.cjs",
  logLevel: "info",
  sourcemap: true,
  legalComments: "none",
  minify: true
});
