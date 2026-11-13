# How Australia Pays

A single-page FIT3179 Data Visualisation 2 project, currently credited to Daniel Loh. Seventeen Vega-Lite charts include three maps. The page follows payment habits, devices, digital exclusion, banking access, newer payment methods and risk.

## Run locally

From this folder:

```sh
python3 -m http.server 8000
```

Visit <http://localhost:8000/>. Opening `index.html` directly with `file://` will block chart/data loading. The page requires an internet connection for the pinned jsDelivr libraries and Google Fonts; fallback fonts are defined. It requires no build step and no npm packages to view.

## Files

- `index.html`, `css/style.css`, `js/main.js`: the scrollable story and responsive embedding.
- `specs/`: 17 readable, separately loaded Vega-Lite JSON specifications.
- `data/`: working datasets organised into `source/` (by publisher), `derived/`, `geography/` and `metadata/`. See `data/README.md`.
- `archive/`: unused datasets, original ZIP packs and duplicate inputs, with a relocation record. See `archive/README.md`.
- `CHART_INVENTORY.md`: implemented idioms, actual data dependencies and design rationale.
- `archive/ai-working-notes/`: original AI build brief and historical hand-off notes; retained for reference.
- `MOODLE_DESCRIPTION.md`: editable What/Why/How submission draft.
- `tools/`: preparation, rendering, browser checks and validation evidence.

## Verify and regenerate

```sh
cd tools
npm ci
npm test
```

This compiles and executes every chart with Vega 5.30.0 / Vega-Lite 5.21.0, checks referenced files and TopoJSON object names, enforces the data-size ceiling, and saves PNGs plus `render/validation.json`. Review those images: a successful compile alone cannot detect blank or misleading charts.

With a server running on port 8000 and Playwright Chromium installed:

```sh
cd tools
npm run check:browser
```

The browser check covers 1280, 1024 and 390 px widths plus dark mode, chart load failures, console errors and horizontal overflow. Screenshots and metrics are written under `tools/render/`.

Regenerate the derived data from the project root:

```sh
python3 tools/prep_data.py
python3 tools/prepare_bank_post.py
```

Boundary regeneration and exact download query are in `data/geography/BOUNDARIES.md`. Statistical inputs are not modified by boundary preparation.

## GitHub Pages deployment

1. Review `archive/ai-working-notes/HANDOFF.md`, confirm the author and sketch, and review source caveats before submission.
2. Add `index.html`, `css/`, `js/`, `specs/`, `data/` and these Markdown documents to the repository. Do not upload `tools/node_modules/`, working ZIPs or browser artifacts.
3. Push to your intended branch. In repository **Settings → Pages**, choose **Deploy from a branch**, the intended branch, and **/(root)**. Save.
4. Open the published URL after deployment, check charts and the 2017/2026 control, then put that exact URL into the Moodle draft. Keep paths relative so project Pages URLs work.

No remote push, publication or submission is performed by the local build.

## Sources and reuse

Full titles, dates and URLs are in [`data/metadata/sources.csv`](data/metadata/sources.csv), the page footer and [historical source-review notes](archive/ai-working-notes/HANDOFF.md).

- **Reserve Bank of Australia:** [copyright notice](https://www.rba.gov.au/copyright/), checked 13 November 2026. Eligible article material is CC BY 4.0; financial statistics have Section 5 conditions; attribution and third-party exceptions apply. No RBA chart images or branding are copied.
- **Thomas et al., Australian Digital Inclusion Index 2025:** [DOI](https://doi.org/10.60836/mtsq-at22), CC BY-NC-SA 4.0. ADII-derived material in this project is offered on those terms, including attribution, non-commercial use and share-alike. Data were collected in 2024; the affordability measure changed, so no earlier-edition trend is asserted.
- **APRA points of presence:** [source](https://www.apra.gov.au/authorised-deposit-taking-institutions-points-of-presence-statistics), CC BY 3.0 AU as recorded in the supplied source register.
- **ABS ASGS 2021 state geometry:** CC BY 4.0, © Commonwealth of Australia, converted and simplified; see [`data/geography/BOUNDARIES.md`](data/geography/BOUNDARIES.md).
- **ACCC / NASC:** [reports](https://www.nasc.gov.au/reports-and-publications/targeting-scams), [CC BY 4.0 website terms](https://www.accc.gov.au/about-us/using-our-website/disclaimer-and-copyright), subject to third-party/report exceptions.
- **AusPayNet:** primary 2025 report and secondary reporting of 2026 figures are distinguished in the register. Report-specific reuse terms still need final review; no report graphics are reproduced.
- **ASIC INFO 285:** primary verification of the buy now pay later licensing milestone; linked in the page and hand-off.

These are source-specific rights, not a blanket licence over all third-party material. The original unverified community map file has been replaced with official ABS geometry.

AI assistance: Claude Code and OpenAI Codex assisted with data preparation, specifications, page code, review and documentation. The student remains responsible for verifying the final work and explaining it in the interview.
