/**
 * build-solid-condition.mjs
 *
 * Produces the preserved-JSX output for the "solid" export condition.
 *
 * Resolves via the "solid" condition in package.json exports.
 * SolidStart / Astro / custom SSR bundlers that resolve the "solid" condition
 * receive these files and run their own babel-preset-solid compilation pass.
 *
 * Output: dist/*.jsx — raw JSX (<tags> intact, NO createComponent/_tmpl$)
 *
 * Why esbuild directly (not vite build): Rollup's parser cannot parse JSX, so a
 * Vite/Rollup second pass cannot produce JSX-preserved output. esbuild supports
 * jsx:"preserve" natively in its build API and writes valid .jsx files.
 *
 * Usage: node scripts/build-solid-condition.mjs
 * Called from: npm run build (after vite build, before tsc --emitDeclarationOnly)
 */

import esbuild from "esbuild";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readdirSync, statSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, "..", "src");
const distDir = join(__dirname, "..", "dist");

// Collect all .ts and .tsx source files recursively under src/,
// excluding test files and directories.
function collectSourceFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      // Skip test directories
      if (entry === "tests" || entry === "__tests__") continue;
      files.push(...collectSourceFiles(full));
    } else if (/\.(tsx?|jsx?)$/.test(entry)) {
      // Skip test and story files
      if (/(\.test|\.spec|\.stories)\.(tsx?|jsx?)$/.test(entry)) continue;
      files.push(full);
    }
  }
  return files;
}

const entryPoints = collectSourceFiles(srcDir);

console.log(
  `Building solid condition (jsx:preserve) for ${entryPoints.length} source files...`
);

await esbuild.build({
  entryPoints,
  // outbase mirrors preserveModulesRoot:"src" — strips the src/ prefix from paths.
  // e.g. src/assets/icons/ChevronDown.tsx → dist/assets/icons/ChevronDown.jsx
  outbase: srcDir,
  outdir: distDir,
  format: "esm",
  // No bundling — one output file per input file (mirrors preserveModules:true).
  bundle: false,
  // Preserve JSX — do NOT compile to createComponent/_tmpl$. The consumer's
  // bundler (vite-plugin-solid / babel-preset-solid) will handle compilation.
  jsx: "preserve",
  // Map all source extensions to .jsx so consumers see the solid condition files.
  outExtension: { ".js": ".jsx" },
  // Strip TypeScript; keep JSX.
  loader: {
    ".ts": "ts",
    ".tsx": "tsx",
    ".js": "js",
    ".jsx": "jsx",
  },
  // Source maps for debugging.
  sourcemap: false,
});

console.log(
  "Solid condition build complete. dist/*.jsx files contain preserved JSX."
);
