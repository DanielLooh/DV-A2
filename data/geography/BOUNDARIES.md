# State boundary provenance

Source: Australian Bureau of Statistics, Australian Statistical Geography Standard (ASGS), Edition 3 (2021), State and Territory (STE). © Commonwealth of Australia. Accessed 13 November 2026.

[Official service catalogue](https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs/edition-4-july-2026-june-2031/access-and-downloads/geospatial-web-services) · [ABS copyright / CC BY 4.0](https://www.abs.gov.au/website-privacy-copyright-and-disclaimer).

The ABS service metadata explicitly states CC BY 4.0 unless otherwise noted. The previously supplied community boundary file has been replaced; no claim is made about its original licence.

Download query:

```text
https://geo.abs.gov.au/arcgis/rest/services/ASGS2021/STE/MapServer/0/query?where=1%3D1&outFields=*&outSR=4326&maxAllowableOffset=0.025&geometryPrecision=4&f=geojson
```

Rebuild after downloading the query response:

```sh
node tools/prepare_boundaries.mjs /path/to/abs-states.geojson
```

The converter keeps the eight states and internal territories, renames the state-name property to `STATE_NAME`, converts to TopoJSON object `states`, and uses spherical ring orientation for Vega. Small rings below 0.0001 square degrees and invalid polygon fragments are omitted for display; coordinates have four decimal places from the query. External territories are excluded to keep the national map legible. This is cartographic simplification, not a change to statistical values. The 2021 boundaries provide context for state statistics; they do not purport to show historical branch catchments.
