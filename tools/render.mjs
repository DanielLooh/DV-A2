// Headless renderer: compile a Vega-Lite spec, render to SVG, rasterise to PNG.
// Usage: node render.mjs <spec.json> <out.png> [scale]
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import vega from "vega";
import vegaLite from "vega-lite";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const specFile = process.argv[2];
const outFile = process.argv[3];
const scale = process.argv[4] ? Number(process.argv[4]) : 1.5;

if (!specFile || !outFile) {
  console.error("usage: node render.mjs <spec.json> <out.png> [scale]");
  process.exit(1);
}

const vlSpec = JSON.parse(fs.readFileSync(path.resolve(ROOT, specFile), "utf8"));
const compiled = vegaLite.compile(vlSpec).spec;

// Rewrite relative data URLs to absolute filesystem paths for headless loading.
function absolutiseUrl(u) {
  return typeof u === "string" && !/^(https?|file):/.test(u) ? path.join(ROOT, u) : u;
}
(function absolutise(node) {
  if (Array.isArray(node)) return node.forEach(absolutise);
  if (node && typeof node === "object") {
    if (typeof node.url === "string") node.url = absolutiseUrl(node.url);
    if (node.data && typeof node.data === "object" && typeof node.data.url === "string") {
      node.data.url = absolutiseUrl(node.data.url);
    }
    for (const k of Object.keys(node)) absolutise(node[k]);
  }
})(compiled);

const view = new vega.View(vega.parse(compiled), {
  renderer: "none",
  baseURL: new URL("file://" + ROOT + path.sep).href,
  logLevel: vega.Warn
});

await view.runAsync();
const svg = await view.toSVG();
fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
await sharp(Buffer.from(svg), { density: 72 * scale }).png().toFile(path.resolve(outFile));
const w = view._width, h = view._height;
console.log(`rendered ${specFile} -> ${outFile} (view ${w}x${h})`);
