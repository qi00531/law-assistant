#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-}"
SERVICE_USER="${2:-}"
OUTPUT_DIR="${3:-}"
PYTHON_BIN="${4:-}"

if [[ -z "$ROOT_DIR" || -z "$SERVICE_USER" || -z "$OUTPUT_DIR" || -z "$PYTHON_BIN" ]]; then
  echo "Usage: $0 <root-dir> <service-user> <output-dir> <python-bin>" >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

for template in "$ROOT_DIR"/deploy/systemd/*.service.template; do
  target_name="$(basename "${template%.template}")"
  sed \
    -e "s|__APP_DIR__|$ROOT_DIR|g" \
    -e "s|__SERVICE_USER__|$SERVICE_USER|g" \
    -e "s|__PYTHON_BIN__|$PYTHON_BIN|g" \
    "$template" > "$OUTPUT_DIR/$target_name"
done
