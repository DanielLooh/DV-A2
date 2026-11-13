"""Extract recorded 2026 Bank@Post locations for the dot-distribution map."""
import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STATES = {"ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"}
FIELDS = ["state", "remoteness", "lat", "lon"]

with (ROOT / "data/source/apra/apra_branch_points_2017_2026.csv").open() as source:
    rows = [
        row for row in csv.DictReader(source)
        if row["year"] == "2026" and row["channel"] == "bank_post"
        and row["state"] in STATES and row["lat"] and row["lon"]
    ]

with (ROOT / "data/derived/bank_post_locations_2026.csv").open("w", newline="") as output:
    writer = csv.DictWriter(output, fieldnames=FIELDS)
    writer.writeheader()
    writer.writerows({field: row[field] for field in FIELDS} for row in rows)

print(f"Wrote {len(rows):,} Bank@Post locations")
