# Implemented chart inventory

17 charts, including 3 maps, all Vega-Lite. Actual inputs below are read from the implemented specifications. The supplied manifest is retained unchanged as the original design inventory.

| ID | Idiom | Brief classification | Files actually loaded |
| --- | --- | --- | --- |
| C4 | Streamgraph (or normalised stacked area) | advanced | `data/source/rba/cps_payment_methods_2007_2025.csv` |
| C5 | Waffle / unit chart (100 squares) with 2022 vs 2025 and Oct 2024 wallet shares | advanced | `data/derived/c5_waffle.csv`; `data/source/rba/rps_mobile_wallet_oct2024.csv` |
| C6 | Area chart plus line | basic | `data/source/rba/cps_online_payments_2007_2025.csv` |
| C8 | Grouped horizontal bar charts | basic | `data/source/rba/cash_use_2025.csv` |
| C16 | Cleveland dot plot (ranked) | basic | `data/source/adii/adii_2025_groups.csv` |
| C17 | Small multiples bars | basic | `data/source/rba/cps_demographics_2025.csv` |
| M1 | Choropleth map | advanced (map) | `data/geography/au_states.topojson`; `data/derived/state_labels.csv` |
| M2 | Dot-distribution map (one dot per Bank@Post location; metropolitan insets) | advanced (map) | `data/geography/au_states.topojson`; `data/derived/bank_post_locations_2026.csv` |
| C11 | Heatmap (state x year, faceted by channel) | advanced | `data/source/apra/apra_index_state_channel_2017_2026.csv` |
| C10 | Lollipop / range chart (log scale) | basic | `data/source/rba/rba_cash_access_points_june2024.csv`; `data/source/rba/rba_cash_withdrawal_distance_by_remoteness_2024.csv` |
| C12 | 100% stacked bar | basic | `data/source/adii/adii_2025_connectivity_issues_by_remoteness.csv` |
| M3 | Proportional symbol map | advanced (map) | `data/geography/au_states.topojson`; `data/derived/m3_branch_cells.csv` |
| C13 | Parallel coordinates | advanced | `data/derived/state_profile_adii_apra.csv` |
| C7 | Dumbbell (dot plot) / slope | basic | `data/source/rba/cps_alternative_methods.csv` |
| C9 | Diverging bar | basic | `data/source/rba/rps_growth_sep2026.csv` |
| C15 | Annotated timeline | advanced | `data/derived/policy_timeline_checked.csv` |
| C14 | Slope chart + small line | advanced (confirm with tutor) | `data/source/auspaynet/auspaynet_card_fraud.csv`; `data/source/nasc/nasc_scam_losses_by_type.csv` |

The brief counts C4, C5, C11, C13, C14, C15 and M1–M3 as advanced candidates (9 charts after C8 was changed to grouped bars). It explicitly asks the student to confirm slope-chart classification with the tutor. C7 and C10 remain basic under its conservative classifications. C4 rescales each survey year's rounded shares, so it is a constant-total centred band/stacked area chart, not observed annual data.

Three distinct map idioms are implemented: a choropleth (M1), a dot-distribution map (M2), and proportional symbols (M3). Insets in M2 are repeated views of the same map, not additional charts or idioms. Do not claim a guaranteed count of eight distinct advanced idiom types: repeated slopes and borderline classifications remain subject to marking.

## Rationale for the interview

- M1 encodes state digital-inclusion summaries with sequential colour. Albers with Australian parallels provides national context.
- M2 plots 3,299 recorded Bank@Post locations in 2026 using constant-sized dots, with Sydney and Melbourne insets. Five external-territory records are excluded. Insets use Mercator for local detail; neither map measures travel distance or service coverage. No points are randomly placed, and size does not encode counts. The compact display CSV filters the supplied APRA location file to 2026 Bank@Post records in the eight states and territories.
- M3 uses a common **linear area scale** for both years so circle area is proportional to counts. Counts aggregate to 0.25-degree cells, with a year radio selector.
- C4 normalises rounding totals and shows composition through band thickness. Straight segments connect survey snapshots; there are no observed annual values between them.
- C5 uses largest-remainder allocation to fill 100 squares. The 2022 inputs total 98, so its drawn square allocation differs from published labels and is explicitly explained.
- C6 separates share of all payments from app share of online payments; they have different denominators.
- C8 uses grouped bars with a zero baseline to compare 2007 and 2025. Approximate labels are retained; absent 2007 purpose values are labelled unavailable rather than drawn as zeros.
- C14 compares stated endpoints; hover highlights a series. Isolated points do not invent missing earlier/later values.
- C10 uses logarithmic distance to accommodate remote and city scales. Distances are straight-line access measures, not road travel.
- C11 normalises service counts to 2017 = 100 to compare changes rather than state size.
- C13 independently scales every axis from the lowest to highest state, with labels showing the range and tooltips giving raw units. Higher positions mean higher scores or smaller service declines; axis slopes do not imply correlation or causation.
- C15 uses a fixed dated reference, not a misleading continuously current “Today” line. Date precision is disclosed.
- C16 includes a national reference; C17 shows only stated subgroup values rather than filling absent groups.

White chart panels preserve chart colour interpretation across page themes. Method colours are consistent between C4, C6 and the debit/credit panels of C17; other categorical scales are local to their concepts. Direct labels, positions and hover isolation supplement colour. A formal colour-vision simulation is still a student review item.
