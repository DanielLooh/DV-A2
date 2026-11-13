# Project data

This folder contains the datasets loaded by the current page, preparation inputs,
and their provenance. Chart URLs are relative to the project root.

| Folder | Contents |
| --- | --- |
| `source/rba/` | RBA payment surveys, cash-access figures, retail-payment growth and card-channel preparation inputs. |
| `source/apra/` | APRA service-count series and the original location file used to prepare branch cells and Bank@Post dots. |
| `source/adii/` | ADII digital exclusion and connectivity data. |
| `source/nasc/` | Reported scam losses. |
| `source/auspaynet/` | Card-fraud data, including disclosed secondary figures. |
| `derived/` | Chart-ready transformations: waffle layout, geographic cells, filtered locations, joined state profiles, state labels and the checked policy timeline. |
| `geography/` | Official ABS state boundaries and `BOUNDARIES.md` provenance. |
| `metadata/` | `sources.csv`, the original chart manifest, and supplied data-quality flags. |

“Source” identifies the publisher; these supplied CSV extracts are not necessarily
untouched downloads from that publisher. “Derived” identifies display preparation,
not invented observations. The supplied quality flags are historical notes; see
`../archive/ai-working-notes/HANDOFF.md` for their current handling.

Regenerate the waffle, branch cells and Bank@Post display files from the project root:

```sh
python3 tools/prep_data.py
python3 tools/prepare_bank_post.py
```

Boundary preparation is documented in `geography/BOUNDARIES.md`. Chart dependencies
are listed in `../CHART_INVENTORY.md`.

Unused datasets and original source ZIPs are preserved under `../archive/`.
The standalone historical prototype keeps its own data in `../Prototype/data/`.
