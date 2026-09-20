#!/usr/bin/env bash
# Canonical native entrypoint. Keep sing-box-plus.sh as a compatibility name.
set -Eeuo pipefail
exec "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/sing-box-plus.sh" "$@"
