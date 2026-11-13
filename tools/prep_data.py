#!/usr/bin/env python3
"""Prepares derived data files used by the page specs.

Run from the repo root:  python3 tools/prep_data.py

Outputs (into data/derived/):
  - m3_branch_cells.csv : branch locations aggregated to 0.25-degree cells
  - c5_waffle.csv       : 100-square waffle layout for 2022/2025 card channels
Nothing here invents data: cells are sums of APRA rows; waffle squares are
largest-remainder roundings of the stated CPS shares (footnoted on the page).
"""
import csv
import math
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")


def aggregate_branch_cells():
    """Sum branch counts into 0.25-degree cells, centre = cell midpoint."""
    cells = {}
    with open(os.path.join(DATA, "source/apra/apra_branch_points_2017_2026.csv")) as f:
        for row in csv.DictReader(f):
            if row["channel"] != "branch":
                continue
            if row["state"] == "Other":
                continue  # external territories sit far off the mainland map
            try:
                lat = float(row["lat"])
                lon = float(row["lon"])
            except (ValueError, KeyError):
                continue  # some APRA locations lack coordinates (noted on page)
            n = float(row["count"] or 1)
            clat = math.floor(lat / 0.25) * 0.25 + 0.125
            clon = math.floor(lon / 0.25) * 0.25 + 0.125
            key = (int(row["year"]), clon, clat)
            cells[key] = cells.get(key, 0) + n
    out = os.path.join(DATA, "derived/m3_branch_cells.csv")
    with open(out, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["year", "lon", "lat", "branches"])
        for (year, clon, clat), n in sorted(cells.items()):
            w.writerow([year, f"{clon:.3f}", f"{clat:.3f}", int(n)])
    for year in (2017, 2026):
        total = sum(n for (y, _, _), n in cells.items() if y == year)
        print(f"m3_branch_cells.csv: {year} total branches = {int(total)}")


def waffle_squares():
    """100 squares per year from the stated CPS channel shares.

    Shares come from cps_card_channels_2022_2025.csv. Because 'insert card' is
    only stated as 'around 5%', the shares do not sum to exactly 100; squares
    are allocated by largest remainder so each square is one percentage point.
    """
    shares = {}
    with open(os.path.join(DATA, "source/rba/cps_card_channels_2022_2025.csv")) as f:
        for row in csv.DictReader(f):
            shares[(int(row["year"]), row["channel"])] = float(row["share_of_card_payments_pct"])

    out = os.path.join(DATA, "derived/c5_waffle.csv")
    vtypes = {}
    with open(os.path.join(DATA, "source/rba/cps_card_channels_2022_2025.csv")) as f:
        for row in csv.DictReader(f):
            vtypes[(int(row["year"]), row["channel"])] = row["value_type"]
    with open(out, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["year", "square", "channel", "row", "col", "stated_share", "value_type", "share_label"])
        for year in (2022, 2025):
            chans = [("tap_device", shares[(year, "tap_device")]),
                     ("tap_card", shares[(year, "tap_card")]),
                     ("insert_card", shares[(year, "insert_card")])]
            total = sum(v for _, v in chans)
            # largest-remainder allocation of 100 squares
            raw = {c: v / total * 100 for c, v in chans}
            floors = {c: math.floor(v) for c, v in raw.items()}
            used = sum(floors.values())
            rem = 100 - used
            alloc = dict(floors)
            by_rem = sorted(raw, key=lambda c: raw[c] - floors[c], reverse=True)
            for c in by_rem[:rem]:
                alloc[c] += 1
            order = ["tap_device", "tap_card", "insert_card"]
            sq = 0
            for chan in order:
                vt = vtypes[(year, chan)]
                share = shares[(year, chan)]
                prefix = "" if vt == "exact" else "~"
                for _ in range(alloc[chan]):
                    sq += 1
                    row = 9 - (sq - 1) // 10  # row 10 at bottom
                    col = (sq - 1) % 10 + 1
                    w.writerow([year, sq, chan, row, col,
                                f"{share:g}", vt, f"{prefix}{share:g}%"])
            print(f"c5_waffle.csv: {year} squares = {sq} "
                  f"({', '.join(f'{c} {alloc[c]}' for c in order)})")


if __name__ == "__main__":
    aggregate_branch_cells()
    waffle_squares()
