// Headless-Chromium layout verification via Playwright.
// Verifies the page at 1280x1024, 1024x768, 390x844 and a dark-scheme run:
//   - all 17 charts embed (svg present, no error fallbacks)
//   - no horizontal scroll at any width
//   - console errors captured
// Saves screenshots to tools/render/chrome-*.png for human review.
// Usage: node chrome_check.mjs  (expects http server on :8000)

import { chromium } from "playwright";
import fs from "node:fs";

const PAGE = "http://localhost:8000/index.html";

const browser = await chromium.launch();

async function check(width, height, colorScheme, outPrefix) {
  const context = await browser.newContext({
    viewport: { width, height },
    colorScheme,
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text().slice(0, 200)); });
  page.on("pageerror", err => errors.push(String(err).slice(0, 200)));

  await page.goto(PAGE, { waitUntil: "networkidle" });

  // Wait for every .vl to contain an svg (or 60s timeout)
  try {
    await page.waitForFunction(
      () => {
        const els = document.querySelectorAll(".vl");
        if (els.length !== 17) return false;
        for (const el of els) {
          if (!el.querySelector("svg") && !el.querySelector(".vl-error")) return false;
        }
        return document.querySelectorAll(".vl svg").length === 17;
      },
      { timeout: 60000 }
    );
  } catch (e) {
    // fall through with whatever loaded; metrics below will reveal problems
  }
  await page.waitForTimeout(1500);

  const m = await page.evaluate(() => {
    const vw = window.innerWidth;
    const wide = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (cs.display === "none") continue;
      if (r.width > 0 && (r.right > vw + 1 || r.left < -1)) {
        wide.push(
          el.tagName.toLowerCase() +
            (el.id ? "#" + el.id : "") +
            "." + String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className).split(" ")[0] +
            " right=" + Math.round(r.right)
        );
        if (wide.length >= 6) break;
      }
    }
    const svgWidths = Array.from(document.querySelectorAll(".vl svg")).map(s => {
      const r = s.getBoundingClientRect();
      return Math.round(r.width);
    });
    return {
      innerWidth: vw,
      scrollWidth: document.documentElement.scrollWidth,
      svg: document.querySelectorAll(".vl svg").length,
      err: document.querySelectorAll(".vl .vl-error").length,
      wide,
      svgWidths
    };
  });

  await page.screenshot({ path: `render/${outPrefix}-${width}.png`, fullPage: false });
  await page.screenshot({ path: `render/${outPrefix}-${width}-full.png`, fullPage: true });

  console.log(
    `\n== ${outPrefix} ${width}x${height} (${colorScheme}) ==` +
    `\n  charts: ${m.svg}/17 svgs, ${m.err} error fallbacks` +
    `\n  horizontal: scrollWidth ${m.scrollWidth} vs viewport ${m.innerWidth} -> ` +
    (m.scrollWidth <= m.innerWidth + 1 ? "OK" : "HORIZONTAL SCROLL") +
    (m.wide.length ? `\n  overflow elements: ${m.wide.join(" | ")}` : "") +
    (errors.length ? `\n  console errors (${errors.length}):\n    ${errors.slice(0, 6).join("\n    ")}` : "\n  no console errors")
  );

  await context.close();
  const pass = m.svg === 17 && m.err === 0 && m.scrollWidth <= m.innerWidth + 1 && errors.length === 0;
  return { pass, ...m, errors };
}

const results = [];
results.push(await check(1280, 1024, "light", "chrome"));
results.push(await check(1024, 768, "light", "chrome"));
results.push(await check(390, 844, "light", "chrome"));
results.push(await check(1280, 1024, "dark", "chrome-dark"));

await browser.close();

const pass = results.every(r => r.pass);
console.log(`\n${pass ? "ALL BROWSER CHECKS PASS" : "SOME CHECKS FAILED"}`);
fs.writeFileSync("render/svg-widths.json", JSON.stringify(results[2].svgWidths)); // 390px chart widths
process.exit(pass ? 0 : 1);
