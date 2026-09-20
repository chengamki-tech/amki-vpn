#!/usr/bin/env bash
# Canonical native entrypoint. Fetch the implementation when only this file
# was downloaded from the raw install URL.
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
IMPLEMENTATION="$SCRIPT_DIR/sing-box-plus.sh"
IMPLEMENTATION_URL="${AMKI_VPN_IMPL_URL:-https://raw.githubusercontent.com/chengamki-tech/amki-vpn/main/sing-box-plus.sh}"

if [[ ! -f "$IMPLEMENTATION" ]]; then
  command -v curl >/dev/null 2>&1 || {
    echo "amki-vpn: curl is required to download the implementation" >&2
    exit 1
  }
  tmp="$(mktemp "$SCRIPT_DIR/.sing-box-plus.sh.XXXXXX")"
  trap 'rm -f "$tmp"' EXIT
  curl -fsSL --retry 3 --connect-timeout 10 --max-time 120 \
    "$IMPLEMENTATION_URL" -o "$tmp"
  chmod 700 "$tmp"
  mv -f "$tmp" "$IMPLEMENTATION"
  trap - EXIT
fi

exec "$IMPLEMENTATION" "$@"
