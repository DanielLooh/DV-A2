// Scenegraph linter for a Vega-Lite spec, rendered headlessly.
// Reports: view size, mark counts, text items that overlap other text items,
// and any item that extends beyond the view bounds.
// Usage: node check.mjs <spec.json>
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import vega from "vega";
import vegaLite from "vega-lite";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const specFile = process.argv[2];
if (!specFile) { console.error("usage: node check.mjs <spec.json>"); process.exit(1); }

const vlSpec = JSON.parse(fs.readFileSync(path.resolve(ROOT, specFile), "utf8"));
const compiled = vegaLite.compile(vlSpec).spec;

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

const view = new vega.View(vega.parse(compiled), { renderer: "none", logLevel: vega.Warn });
await view.runAsync();

// The final SVG is self-sizing: vega pads for titles/legends beyond the
// inner width/height. Parse the real size and root translate from the SVG.
const svgStr = await view.toSVG();
const svgW = Number((svgStr.match(/width="(\d+)"/) || [])[1]);
const svgH = Number((svgStr.match(/height="(\d+)"/) || [])[1]);
const m = svgStr.match(/<g[^>]*transform="translate\(([-\d.]+)[, ]*([-\d.]+)\)"/);
const tx = m ? Number(m[1]) : 0, ty = m ? Number(m[2]) : 0;
const W = svgW, H = svgH;
const pad = view._padding ? { l: view._padding.left ?? 0, r: view._padding.right ?? 0, t: view._padding.top ?? 0, b: view._padding.bottom ?? 0 } : { l: 0, r: 0, t: 0, b: 0 };
console.log(`svg size: ${W}x${H} (inner view ${view._width}x${view._height}, root translate ${tx},${ty})`);

// Walk the scenegraph collecting items with absolute (view) bounds
const items = [];
(function walk(node, dx, dy) {
  if (!node) return;
  if (Array.isArray(node)) { node.forEach(n => walk(n, dx, dy)); return; }
  if (node.bounds) {
    items.push({
      mark: node.mark ? (node.mark.marktype || node.mark.type || "?") : "?",
      role: node.mark && node.mark.role ? node.mark.role : "",
      text: typeof node.text === "string" ? node.text : null,
      angle: typeof node.angle === "number" ? node.angle : 0,
      b: {
        x1: node.bounds.x1 + dx, y1: node.bounds.y1 + dy,
        x2: node.bounds.x2 + dx, y2: node.bounds.y2 + dy
      }
    });
  }
  if (node.items) {
    const nx = dx + (node.x || 0), ny = dy + (node.y || 0);
    walk(node.items, nx, ny);
  }
})(view._scenegraph.root.items, tx, ty);

const counts = {};
for (const it of items) counts[it.mark] = (counts[it.mark] || 0) + 1;
console.log("item counts by mark type:", JSON.stringify(counts));

// Text overlap check (text items only, ignore guides within the same mark group).
// Rotated text (e.g. angled axis labels) is skipped: its axis-aligned bbox
// includes empty corners, so bbox intersection is not a glyph collision —
// rotation exists precisely so diagonal neighbours clear each other.
const texts = items.filter(i => i.text !== null && i.text !== "");
const overlaps = [];
for (let i = 0; i < texts.length; i++) {
  for (let j = i + 1; j < texts.length; j++) {
    if (texts[i].angle || texts[j].angle) continue;
    const a = texts[i].b, b = texts[j].b;
    const ox = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1);
    const oy = Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1);
    if (ox > 1 && oy > 1) overlaps.push([texts[i], texts[j], ox, oy]);
  }
}
if (overlaps.length) {
  console.log(`\nTEXT OVERLAPS (${overlaps.length}):`);
  for (const [a, b, ox, oy] of overlaps.slice(0, 30)) {
    console.log(`  "${a.text}" (${a.role || a.mark}) X "${b.text}" (${b.role || b.mark}) by ${ox.toFixed(1)}x${oy.toFixed(1)}px`);
  }
} else {
  console.log("no text overlaps detected");
}

// Overflow check: bounds outside the padded view box (allow 2px tolerance)
const over = items.filter(i => {
  return i.b.x1 < -2 || i.b.y1 < -2 || i.b.x2 > W + 2 || i.b.y2 > H + 2;
});
if (over.length) {
  console.log(`\nITEMS OUTSIDE VIEW BOUNDS (${over.length}):`);
  for (const i of over.slice(0, 20)) {
    console.log(`  ${i.mark}/${i.role || "-"} "${i.text ?? ""}" bounds ${i.b.x1.toFixed(0)},${i.b.y1.toFixed(0)} -> ${i.b.x2.toFixed(0)},${i.b.y2.toFixed(0)}`);
  }
} else {
  console.log("all items inside view bounds");
}
