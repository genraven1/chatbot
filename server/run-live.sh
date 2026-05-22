#!/usr/bin/env bash
# Runs Cart Recovery AI with LIVE AI via the LiteLLM proxy.
#
# Secrets are read from .env (gitignored) — never commit that file.
# Without .env (or with a blank LITELLM_API_KEY) the app starts in mock mode.
set -euo pipefail
cd "$(dirname "$0")"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
  echo "Loaded .env — model=${LITELLM_MODEL:-unset}"
else
  echo ".env not found — starting in MOCK mode (no LLM calls)."
fi

PORT="${SERVER_PORT:-8087}"

# Compile (offline-friendly).
mvn -q -o compile

# spring-boot:run cannot resolve its plugin dependencies against an offline
# Maven mirror, so run from the compiled classpath instead — works offline
# and online alike.
CP_FILE="$(mktemp)"
trap 'rm -f "$CP_FILE"' EXIT
mvn -q -o dependency:build-classpath -Dmdep.outputFile="$CP_FILE"

echo "Starting Cart Recovery AI -> http://localhost:${PORT}/"
exec java -cp "target/classes:$(cat "$CP_FILE")" -Dserver.port="${PORT}" \
  com.marriott.codefest.cartrecovery.CartRecoveryApplication
