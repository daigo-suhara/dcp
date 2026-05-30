import * as esbuild from "esbuild";
import { copyFile, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";

await mkdir("dist", { recursive: true });
await esbuild.build({
  entryPoints: ["src/main.jsx"],
  bundle: true,
  outfile: "dist/bundle.js",
  format: "iife",
  loader: {
    ".js": "jsx",
    ".jsx": "jsx"
  },
  define: {
    "process.env.NODE_ENV": '"production"'
  },
  minify: true,
  target: ["es2020"]
});

execFileSync(
  "./node_modules/.bin/tailwindcss",
  ["-i", "src/styles.css", "-o", "dist/styles.css", "--minify"],
  { stdio: "inherit" }
);

await copyFile("index.html", "dist/index.html");
await mkdir("dist/assets", { recursive: true });
await copyFile("assets/celebration.svg", "dist/assets/celebration.svg");
