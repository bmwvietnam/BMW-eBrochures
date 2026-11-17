import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const VERSION = "6.5.438";
const PKG_DIR = join(ROOT, "node_modules", "pdfjs-dist");
const PKG_META = join(PKG_DIR, "package.json");
const vendorOnly = process.argv.includes("--vendor-only");
const output = vendorOnly ? ROOT : join(ROOT, "_site");
const dest = join(output, "vendor", "pdfjs", VERSION);

function fail(message) { console.error(`ERROR: ${message}`); process.exit(1); }
if (!existsSync(PKG_META)) fail("Chưa cài pdfjs-dist. Chạy: npm install");
const pkg = JSON.parse(readFileSync(PKG_META, "utf8"));
if (pkg.version !== VERSION) fail(`Cần pdfjs-dist ${VERSION}; đã tìm thấy ${pkg.version}`);

if (!vendorOnly) {
  rmSync(output, { recursive: true, force: true });
  mkdirSync(output, { recursive: true });
  for (const name of ["index.html", "script.js", "style.css", ".nojekyll"]) {
    const input = join(ROOT, name);
    if (!existsSync(input)) fail(`Thiếu file website: ${name}`);
    copyFileSync(input, join(output, name));
  }
  // Thư mục phụ có thể có/không; không sao chép .git, node_modules, build scripts.
  for (const name of ["pdf", "bmw", "assets"]) {
    const input = join(ROOT, name);
    if (existsSync(input)) cpSync(input, join(output, name), { recursive: true });
  }
}

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
for (const name of ["pdf.min.mjs", "pdf.worker.min.mjs"]) {
  const input = join(PKG_DIR, "build", name);
  if (!existsSync(input)) fail(`Thiếu file trong npm package: build/${name}`);
  if (statSync(input).size < 100_000) fail(`File không hợp lệ hoặc quá nhỏ: ${name}`);
  copyFileSync(input, join(dest, name));
}
// PDF.js 6.x có thể sử dụng renderer worker. Copy nếu gói chứa file.
for (const optional of ["pdf.renderer.min.mjs"]) {
  const input = join(PKG_DIR, "build", optional);
  if (existsSync(input)) copyFileSync(input, join(dest, optional));
}
// Tài nguyên phụ cho brochure font tiếng Việt/CJK, hình ảnh JPX/JBIG2, màu ICC.
for (const folder of ["cmaps", "standard_fonts", "wasm", "iccs", "image_decoders"]) {
  const input = join(PKG_DIR, folder);
  if (!existsSync(input)) fail(`Phiên bản ${VERSION} thiếu thư mục ${folder}`);
  cpSync(input, join(dest, folder), { recursive: true });
}
const license = join(PKG_DIR, "LICENSE");
if (!existsSync(license)) fail("Thiếu file LICENSE của PDF.js");
copyFileSync(license, join(dest, "LICENSE"));
writeFileSync(join(dest, "VERSION.txt"), `pdfjs-dist ${VERSION}\nSource: https://github.com/mozilla/pdf.js\nLicense: Apache-2.0\n`);
const fileCount = readdirSync(dest, { recursive: true, withFileTypes: true }).filter(d => d.isFile()).length;
console.log(`Built PDF.js ${VERSION} locally: ${fileCount} files -> ${dest}`);
if (!vendorOnly) console.log("GitHub Pages artifact ready: _site/ (không chứa node_modules)");
