#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-}"
SERVICE_USER="${2:-}"
OUTPUT_DIR="${3:-}"

if [[ -z "$ROOT_DIR" || -z "$SERVICE_USER" || -z "$OUTPUT_DIR" ]]; then
  echo "Usage: $0 <root-dir> <service-user> <output-dir>" >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

for template in "$ROOT_DIR"/deploy/systemd/*.service.template; do
  target_name="$(basename "${template%.template}")"
  sed \
    -e "s|__APP_DIR__|$ROOT_DIR|g" \
    -e "s|__SERVICE_USER__|$SERVICE_USER|g" \
    "$template" > "$OUTPUT_DIR/$target_name"
done
