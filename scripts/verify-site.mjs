import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
const dir = resolve(process.argv[2] || "_site");
const ver = "6.5.438";
const prefix = join(dir, "vendor", "pdfjs", ver);
const needed = [
  ["index.html", 100], ["script.js", 1000], ["style.css", 1000],
  [`vendor/pdfjs/${ver}/pdf.min.mjs`, 100000],
  [`vendor/pdfjs/${ver}/pdf.worker.min.mjs`, 100000],
  [`vendor/pdfjs/${ver}/LICENSE`, 100],
];
for (const [name, minSize] of needed) {
  const path = join(dir, name);
  if (!existsSync(path) || statSync(path).size < minSize) throw Error(`Missing or incomplete: ${path}`);
}
for (const sub of ["cmaps", "standard_fonts", "wasm", "iccs", "image_decoders"]) {
  if (!existsSync(join(prefix, sub))) throw Error(`Missing PDF.js asset directory: ${sub}`);
}
const script = readFileSync(join(dir, "script.js"), "utf8");
if (script.includes("cdnjs.cloudflare.com") || script.includes("cdn.jsdelivr.net") || script.includes("unpkg.com")) {
  throw Error("Unexpected CDN URL in script.js");
}
if (!script.includes("./vendor/pdfjs/${PDFJS_VERSION}/")) throw Error("Local PDF.js URL missing");
console.log(`OK: PDF.js ${ver} assets are self-hosted in ${dir}`);
