#!/usr/bin/env bash
# Regenerates "Workflows/_Workflows Index.md" — a single last-updated tracker for the
# Workflows folder (used instead of per-file created_on/updated_on stamps).
# Run from the vault root:  bash "Workflows/scripts/refresh_index.sh"
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

OUT="Workflows/_Workflows Index.md"
TODAY=$(date +%Y-%m-%d)

earlier() { if [ -z "$1" ]; then echo "$2"; elif [ -z "$2" ]; then echo "$1"; elif [[ "$1" < "$2" ]]; then echo "$1"; else echo "$2"; fi; }

# Authored workflow files only — exclude deps, caches, logs, temp, binaries, the index itself.
mapfile -t WF < <(find Workflows -type f \
  ! -path "*/node_modules/*" \
  ! -path "*/.remember/*" \
  ! -path "*/.branches/*" \
  ! -path "*/.temp/*" \
  ! -path "*/snippets/*" \
  ! -name "desktop.ini" \
  ! -name "_Workflows Index.md" \
  ! -name "*.xlsx" ! -name "*.png" ! -name "*.log" \
  | sort)

rows=""
for f in "${WF[@]}"; do
  birth=$(stat -c %w "$f" 2>/dev/null | cut -d' ' -f1); [ "$birth" = "-" ] && birth=""
  gitadd=$(git log --diff-filter=A --follow --format=%ad --date=short -- "$f" 2>/dev/null | tail -1)
  created=$(earlier "$birth" "$gitadd"); [ -z "$created" ] && created="—"
  updated=$(stat -c %y "$f" | cut -d' ' -f1)
  rows="${rows}| \`${f#Workflows/}\` | ${created} | ${updated} |"$'\n'
done

wf_created=$(earlier "$(stat -c %w Workflows 2>/dev/null | cut -d' ' -f1)" "$(git log --diff-filter=A --format=%ad --date=short -- Workflows 2>/dev/null | tail -1)")

{
  echo "---"
  echo "created_on: $wf_created"
  echo "updated_on: $TODAY"
  echo "type: index"
  echo "---"
  echo ""
  echo "# Workflows — Last-Updated Index"
  echo ""
  echo "> Single tracker for the \`Workflows/\` folder, used **instead of** per-file \`created_on\`/\`updated_on\` (this folder holds scripts and automation prompts, not vault notes). Dependency, cache, log, temp, and binary files are excluded."
  echo "> **Last regenerated:** $TODAY"
  echo ">"
  echo "> Not self-updating — regenerate with: \`bash \"Workflows/scripts/refresh_index.sh\"\`"
  echo ""
  echo "| File | Created | Last updated |"
  echo "|---|---|---|"
  printf "%s" "$rows"
} > "$OUT"

echo "Wrote $OUT (${#WF[@]} files indexed)"
