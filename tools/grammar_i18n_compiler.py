#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import json
import os
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, List, Tuple, Set


VERSION = "grammar-i18n-compiler/1.0"

DATA_I18N_RE = re.compile(r'''data-i18n\s*=\s*["']([^"']+)["']''', re.IGNORECASE)

DEFAULT_IGNORE_DIRS = {
  "dist",
  "node_modules",
  "vendor",
  ".git",
  ".next",
  ".vercel",
  ".cache",
}


@dataclass
class Node:
  key: str
  grammar: str
  tags: List[str]
  notes: str = ""


def read_json(path: str) -> dict:
  with open(path, "r", encoding="utf-8") as f:
    return json.load(f)


def write_json(path: str, obj: dict) -> None:
  os.makedirs(os.path.dirname(path), exist_ok=True)
  with open(path, "w", encoding="utf-8") as f:
    json.dump(obj, f, ensure_ascii=False, indent=2)


def read_i18n_dir(i18n_dir: str) -> Dict[str, Dict[str, str]]:
  """
  Returns: { lang: { key: value } }
  Accepts: *.json in i18n_dir, filename stem is lang.
  """
  out: Dict[str, Dict[str, str]] = {}
  for fn in os.listdir(i18n_dir):
    if not fn.endswith(".json"):
      continue
    lang = fn[:-5]
    data = read_json(os.path.join(i18n_dir, fn))
    if not isinstance(data, dict):
      raise ValueError(f"i18n/{fn} must be an object map.")
    # Force str keys/values
    cleaned: Dict[str, str] = {}
    for k, v in data.items():
      if not isinstance(k, str):
        continue
      cleaned[k] = "" if v is None else str(v)
    out[lang] = cleaned
  return out


def key_to_grammar(key: str) -> str:
  # g.<domain>.<a>.<b> -> [DOMAIN::A::B]
  if not key.startswith("g."):
    raise ValueError(f"Invalid key (must start with 'g.'): {key}")
  parts = key.split(".")
  if len(parts) < 3:
    raise ValueError(f"Invalid key (need at least g.<domain>.<node>): {key}")
  domain = parts[1].upper()
  rest = [p.upper() for p in parts[2:] if p.strip()]
  return "[" + "::".join([domain] + rest) + "]"


def grammar_to_key(grammar: str) -> str:
  s = grammar.strip()
  if not (s.startswith("[") and s.endswith("]")):
    raise ValueError(f"Invalid grammar (must be bracketed): {grammar}")
  core = s[1:-1]
  parts = [p.strip() for p in core.split("::") if p.strip()]
  if len(parts) < 2:
    raise ValueError(f"Invalid grammar (need at least DOMAIN::NODE): {grammar}")
  domain = parts[0].lower()
  rest = [p.lower() for p in parts[1:]]
  return "g." + domain + "." + ".".join(rest)


def infer_tags_from_key(key: str) -> List[str]:
  # Minimal heuristic tags.
  tags = ["ui"]
  if key.startswith("g.rite."):
    tags.append("rite")
  elif key.startswith("g.term."):
    tags.append("term")
  elif key.startswith("g.bank."):
    tags.append("bank")
  elif key.startswith("g.shop."):
    tags.append("shop")
  elif key.startswith("g.sys."):
    tags.append("sys")
  elif key.startswith("g.site."):
    tags.append("site")
  elif key.startswith("g.confess."):
    tags.append("confess")
  return tags


def i18n_to_nodes(i18n_maps: Dict[str, Dict[str, str]]) -> List[Node]:
  keys: Set[str] = set()
  for _, m in i18n_maps.items():
    keys |= set(m.keys())

  # Only keep grammar namespace keys.
  keys = {k for k in keys if k.startswith("g.")}

  nodes: List[Node] = []
  for k in sorted(keys):
    try:
      g = key_to_grammar(k)
    except Exception:
      # Skip malformed
      continue
    nodes.append(Node(key=k, grammar=g, tags=infer_tags_from_key(k), notes=""))
  return nodes


def nodes_to_skeleton(nodes: List[Node], langs: List[str]) -> Dict[str, Dict[str, str]]:
  out: Dict[str, Dict[str, str]] = {}
  for lang in langs:
    out[lang] = {}
    for n in nodes:
      out[lang][n.key] = ""
  return out


def validate(nodes: List[Node], i18n_maps: Dict[str, Dict[str, str]]) -> Tuple[dict, dict]:
  node_keys = {n.key for n in nodes}
  all_i18n_keys = set()
  for _, m in i18n_maps.items():
    all_i18n_keys |= set(m.keys())

  missing_by_lang: Dict[str, List[str]] = {}
  for lang, m in i18n_maps.items():
    missing = sorted([k for k in node_keys if k not in m])
    missing_by_lang[lang] = missing

  orphan = sorted([k for k in all_i18n_keys if k.startswith("g.") and k not in node_keys])

  missing_report = {
    "version": VERSION,
    "missing_by_lang": missing_by_lang,
    "node_count": len(node_keys),
  }
  orphan_report = {
    "version": VERSION,
    "orphan_keys": orphan,
    "orphan_count": len(orphan),
  }
  return missing_report, orphan_report


def patch(nodes: List[Node], i18n_maps: Dict[str, Dict[str, str]], base_lang: str) -> Dict[str, Dict[str, str]]:
  if base_lang not in i18n_maps:
    raise ValueError(f"base lang '{base_lang}' not found in i18n dir.")
  base = i18n_maps[base_lang]
  node_keys = [n.key for n in nodes]

  out = {lang: dict(m) for lang, m in i18n_maps.items()}
  for lang, m in out.items():
    for k in node_keys:
      if k not in m:
        # fallback to base value; if base also missing, empty
        m[k] = base.get(k, "")
  return out


def cmd_i18n_to_nodes(args):
  i18n_maps = read_i18n_dir(args.i18n_dir)
  nodes = i18n_to_nodes(i18n_maps)
  obj = {
    "version": "gbook-node-index/1.0",
    "generated_by": VERSION,
    "nodes": [asdict(n) for n in nodes],
  }
  write_json(args.out, obj)


def cmd_nodes_to_skeleton(args):
  nodes_obj = read_json(args.nodes)
  nodes = [Node(**n) for n in nodes_obj.get("nodes", [])]
  skel = nodes_to_skeleton(nodes, args.langs)
  os.makedirs(args.out_dir, exist_ok=True)
  for lang, m in skel.items():
    write_json(os.path.join(args.out_dir, f"{lang}.json"), m)


def cmd_validate(args):
  nodes_obj = read_json(args.nodes)
  nodes = [Node(**n) for n in nodes_obj.get("nodes", [])]
  i18n_maps = read_i18n_dir(args.i18n_dir)

  missing_report, orphan_report = validate(nodes, i18n_maps)
  os.makedirs(args.report_dir, exist_ok=True)
  write_json(os.path.join(args.report_dir, "missing_keys.json"), missing_report)
  write_json(os.path.join(args.report_dir, "orphan_keys.json"), orphan_report)

  # Small md summary
  lines = []
  lines.append("# Grammar ↔ i18n Validation Report")
  lines.append("")
  lines.append(f"- Node keys: {missing_report['node_count']}")
  lines.append(f"- Orphan keys: {orphan_report['orphan_count']}")
  lines.append("")
  lines.append("## Missing keys by language")
  for lang, miss in missing_report["missing_by_lang"].items():
    lines.append(f"- {lang}: {len(miss)}")
  md = "\n".join(lines) + "\n"
  with open(os.path.join(args.report_dir, "diff_summary.md"), "w", encoding="utf-8") as f:
    f.write(md)


def cmd_patch(args):
  nodes_obj = read_json(args.nodes)
  nodes = [Node(**n) for n in nodes_obj.get("nodes", [])]
  i18n_maps = read_i18n_dir(args.i18n_dir)
  patched = patch(nodes, i18n_maps, args.base_lang)

  os.makedirs(args.out_dir, exist_ok=True)
  for lang, m in patched.items():
    write_json(os.path.join(args.out_dir, f"{lang}.json"), m)


def _should_skip_path(path: Path, ignore_dirs: set) -> bool:
  # Skip any path that contains an ignored dir name in its parts.
  parts = set(path.parts)
  return len(parts & ignore_dirs) > 0


def iter_html_files(scan_paths: List[str], ignore_dirs: set) -> List[Path]:
  files: List[Path] = []
  for p in scan_paths:
    root = Path(p)
    if not root.exists():
      continue

    if root.is_file():
      if root.suffix.lower() == ".html" and not _should_skip_path(root, ignore_dirs):
        files.append(root)
      continue

    # Directory: recursively walk
    for hp in root.rglob("*.html"):
      if _should_skip_path(hp, ignore_dirs):
        continue
      files.append(hp)

  # De-dup, stable order
  uniq = sorted({f.resolve() for f in files})
  return uniq


def scan_ui_keys(scan_paths: List[str], ignore_dirs: set) -> Set[str]:
  """Scan HTML files for data-i18n attributes with recursive directory support"""
  keys: Set[str] = set()
  html_files = iter_html_files(scan_paths, ignore_dirs)

  for hp in html_files:
    try:
      text = hp.read_text(encoding="utf-8", errors="ignore")
    except Exception:
      continue

    for m in DATA_I18N_RE.finditer(text):
      k = m.group(1).strip()
      if k:
        keys.add(k)

  return keys


def cmd_scan_ui(args):
  nodes_obj = read_json(args.nodes)
  nodes = [Node(**n) for n in nodes_obj.get("nodes", [])]
  node_keys = {n.key for n in nodes}

  i18n_maps = read_i18n_dir(args.i18n_dir)
  all_i18n_keys = set()
  for _, m in i18n_maps.items():
    all_i18n_keys |= set(m.keys())

  ignore_dirs = set(DEFAULT_IGNORE_DIRS)
  if getattr(args, "ignore", None):
    ignore_dirs |= set(args.ignore)

  ui_keys = scan_ui_keys(args.scan_paths, ignore_dirs)
  ui_g_keys = {k for k in ui_keys if k.startswith("g.")}

  ui_missing_in_nodes = sorted([k for k in ui_g_keys if k not in node_keys])
  nodes_unused_in_ui = sorted([k for k in node_keys if k not in ui_g_keys])

  legacy_orphan = sorted([
    k for k in all_i18n_keys
    if k.startswith("g.") and k not in node_keys and k not in ui_g_keys
  ])

  os.makedirs(args.report_dir, exist_ok=True)
  write_json(os.path.join(args.report_dir, "ui_keys.json"), {
    "version": VERSION,
    "count": len(ui_keys),
    "g_count": len(ui_g_keys),
    "keys": sorted(ui_keys),
  })
  write_json(os.path.join(args.report_dir, "ui_missing_in_nodes.json"), {
    "version": VERSION,
    "count": len(ui_missing_in_nodes),
    "keys": ui_missing_in_nodes,
  })
  write_json(os.path.join(args.report_dir, "nodes_unused_in_ui.json"), {
    "version": VERSION,
    "count": len(nodes_unused_in_ui),
    "keys": nodes_unused_in_ui,
  })
  write_json(os.path.join(args.report_dir, "legacy_orphan_keys.json"), {
    "version": VERSION,
    "count": len(legacy_orphan),
    "keys": legacy_orphan,
  })


def main():
  ap = argparse.ArgumentParser(prog="grammar_i18n_compiler")
  sub = ap.add_subparsers(dest="cmd", required=True)

  p1 = sub.add_parser("i18n-to-nodes")
  p1.add_argument("--i18n-dir", required=True)
  p1.add_argument("--out", required=True)
  p1.set_defaults(func=cmd_i18n_to_nodes)

  p2 = sub.add_parser("nodes-to-skeleton")
  p2.add_argument("--nodes", required=True)
  p2.add_argument("--langs", nargs="+", required=True)
  p2.add_argument("--out-dir", required=True)
  p2.set_defaults(func=cmd_nodes_to_skeleton)

  p3 = sub.add_parser("validate")
  p3.add_argument("--nodes", required=True)
  p3.add_argument("--i18n-dir", required=True)
  p3.add_argument("--report-dir", required=True)
  p3.set_defaults(func=cmd_validate)

  p4 = sub.add_parser("patch")
  p4.add_argument("--nodes", required=True)
  p4.add_argument("--i18n-dir", required=True)
  p4.add_argument("--base-lang", required=True)
  p4.add_argument("--out-dir", required=True)
  p4.set_defaults(func=cmd_patch)

  p5 = sub.add_parser("scan-ui")
  p5.add_argument("--nodes", required=True)
  p5.add_argument("--i18n-dir", required=True)
  p5.add_argument("--scan-paths", nargs="+", required=True)
  p5.add_argument("--ignore", nargs="*", default=[], help="Directory names to ignore during recursive scan.")
  p5.add_argument("--report-dir", required=True)
  p5.set_defaults(func=cmd_scan_ui)

  args = ap.parse_args()
  args.func(args)


if __name__ == "__main__":
  main()
