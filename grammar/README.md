# Grammar Node Index

This directory contains the SSOT (Single Source of Truth) for Grammar Nodes.

## Structure

- `nodes.json` - Grammar node index with key-to-grammar mappings

## Node Format

Each node follows the structure:
```json
{
  "key": "g.rite.baptism.title",
  "grammar": "[RITE::BAPTISM::TITLE]",
  "tags": ["ui", "rite"],
  "notes": ""
}
```

## Key → Grammar Mapping

- Key format: `g.<domain>.<node>[.<subnode>...]`
- Grammar format: `[<DOMAIN>::<NODE>[::<SUBNODE>...]]`

Example:
- `g.rite.baptism.title` → `[RITE::BAPTISM::TITLE]`
- `g.site.fundraising.cta.donate` → `[SITE::FUNDRAISING::CTA::DONATE]`

## Domains

- `site` - Site/worldview content
- `rite` - Ritual/ceremony actions
- `term` - Terminal/command interface
- `bank` - Counters/achievements
- `shop` - Shop/transactions
- `confess` - Confession room
- `sys` - System UI elements

## Usage

See `tools/grammar_i18n_compiler.py` for compilation and validation commands.

