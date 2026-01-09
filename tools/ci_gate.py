#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import sys
from pathlib import Path

def read_json(p: str) -> dict:
  return json.loads(Path(p).read_text(encoding="utf-8"))

def main():
  # Inputs: paths to reports
  ui_missing = read_json("dist/reports/ui_missing_in_nodes.json")
  missing_keys = read_json("dist/reports/missing_keys.json")
  orphan_keys = read_json("dist/reports/orphan_keys.json")

  errors = []

  if ui_missing.get("count", 0) != 0:
    errors.append(f"[FAIL] UI keys missing in nodes.json: {ui_missing.get('count')}")

  # validate() already tells you missing per lang; we fail if any missing exists.
  missing_by_lang = missing_keys.get("missing_by_lang", {})
  missing_total = sum(len(v) for v in missing_by_lang.values() if isinstance(v, list))
  if missing_total != 0:
    errors.append(f"[FAIL] Missing i18n translations for node keys (sum over langs): {missing_total}")

  # orphan_keys here means "i18n has g.* not in nodes" (compiler's orphan report)
  # We do NOT fail on this, because you intentionally keep legacy keys as backups.
  # But we print it for visibility.
  orphan_count = orphan_keys.get("orphan_count", 0)

  if errors:
    print("\n".join(errors))
    print(f"[INFO] i18n orphan keys (legacy allowed): {orphan_count}")
    sys.exit(1)

  print("[OK] Grammar ↔ i18n gates passed.")
  print(f"[INFO] i18n orphan keys (legacy allowed): {orphan_count}")
  sys.exit(0)

if __name__ == "__main__":
  main()

