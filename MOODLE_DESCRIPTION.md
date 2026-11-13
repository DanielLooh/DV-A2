# Moodle description draft — edit before submission

**Title:** How Australia Pays  
**Public URL:** Insert the final GitHub Pages URL after deployment.  
**Author:** Daniel Loh (confirm spelling and preferred credit).

**Domain and audience.** This project explains electronic payments in Australia for a general Australian audience. It asks how cash, cards and devices have changed payment habits, and where digital exclusion and access to cash complicate that transition.

**What (data).** RBA Consumer Payments Survey snapshots describe payment methods, online payments, card channels and selected demographic groups. APRA points-of-presence counts describe banking access. The 2025 Australian Digital Inclusion Index describes digital readiness and exclusion. RBA cash-access distances, NASC scam-loss figures and AusPayNet fraud rates add context. Official ABS state boundaries provide map geometry. These sources have different dates and populations, so they are not presented as one combined survey.

**Why (tasks).** Readers compare payment shares over time, identify groups facing greater digital barriers, compare state service changes, and distinguish payment behaviour from infrastructure and risk. The intended outcome is a guided explanation rather than a banking dashboard or an assertion that branch closures cause digital exclusion.

**How (design).** Seventeen separately stored Vega-Lite specifications appear on one scrollable page. Band thickness communicates payment composition; a 100-square waffle makes card channels concrete; grouped bars compare the two cash-use survey years and slope charts compare scam-loss endpoints; a choropleth shows state digital inclusion; a dot-distribution map shows Bank@Post locations with metropolitan insets; a proportional-symbol map compares branch networks with a year selector. A heatmap reveals channel changes, parallel coordinates compare state profiles on separately scaled axes, and a timeline places dated milestones in context. A log scale makes remote cash-access distances readable without compressing the cities. Direct labels, hover highlights, tooltips and short reading guides support interpretation.

**Creation and custom features.** CSV inputs are kept local. Python aggregates branches into quarter-degree cells and allocates rounded waffle shares by largest remainder. Official boundaries are converted into compact TopoJSON. Charts use responsive SVGs, pinned libraries, white panels in light/dark page themes and accessible narrative descriptions. AI tools (Claude Code and OpenAI Codex) assisted with preparation, code, chart design and verification. I must personally verify the figures, review the narrative and explain each design choice before submission.

**Limitations.** Rounded and derived values are disclosed; missing endpoints are not invented; state averages do not establish local service coverage. The RBA survey has about 1,200 respondents. Some 2025 fraud figures in the supplied pack are secondary reports. The hand-drawn sketch, source review and tutor interpretation of the advanced-idiom criteria must be confirmed. Edit this draft to reflect the final sketch and your own design rationale.
