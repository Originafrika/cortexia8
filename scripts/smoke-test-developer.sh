#!/usr/bin/env bash
set -Eeuo pipefail

BASE_URL="${CORTEXIA_BASE_URL:-https://cortexia.originafrika.online}"
API_KEY="${CORTEXIA_API_KEY:-}"
LIVE_CONFIRMATION="${CORTEXIA_LIVE_CONFIRMATION:-}"
MODE="safe"
if [[ "${1:-}" == "--live-generation" ]]; then
  MODE="live-generation"
fi

PASS=0
WARN=0
FAIL=0

pass() {
  printf 'PASS  %s\n' "$1"
  PASS=$((PASS + 1))
}

warn() {
  printf 'WARN  %s\n' "$1"
  WARN=$((WARN + 1))
}

fail() {
  printf 'FAIL  %s\n' "$1" >&2
  FAIL=$((FAIL + 1))
}

request_status() {
  local method="$1"
  local url="$2"
  local body="${3:-}"
  if [[ "$method" == "GET" ]]; then
    curl --silent --show-error --output /dev/null --write-out '%{http_code}' \
      --connect-timeout 10 --max-time 30 "$url"
  else
    curl --silent --show-error --output /dev/null --write-out '%{http_code}' \
      --connect-timeout 10 --max-time 30 -X "$method" \
      -H 'Content-Type: application/json' --data "$body" "$url"
  fi
}

json_request() {
  local method="$1"
  local url="$2"
  if [[ "$method" == "GET" ]]; then
    curl --silent --show-error --fail-with-body --connect-timeout 10 --max-time 60 \
      -H "Authorization: Bearer ${API_KEY}" "$url"
  else
    curl --silent --show-error --fail-with-body --connect-timeout 10 --max-time 60 \
      -X "$method" -H "Authorization: Bearer ${API_KEY}" \
      -H 'Content-Type: application/json' --data "${3:-}" "$url"
  fi
}

printf 'Cortexia developer smoke test\n'
printf 'Target: %s\n' "$BASE_URL"
printf 'Mode: %s\n\n' "$MODE"

# Public, non-destructive surface checks.
for path in / /auth/sign-in /app/developers /app/models; do
  status="$(request_status GET "${BASE_URL}${path}")"
  if [[ "$status" == "200" || "$status" == "3"* ]]; then
    pass "public route ${path} responds with HTTP ${status}"
  else
    fail "public route ${path} responds with HTTP ${status}"
  fi
done

# The API must not accept unauthenticated access.
models_unauth="$(request_status GET "${BASE_URL}/v1/models")"
if [[ "$models_unauth" == "401" ]]; then
  pass "GET /v1/models rejects missing API key with HTTP 401"
elif [[ "$models_unauth" == "404" ]]; then
  fail "GET /v1/models is not deployed (HTTP 404)"
else
  fail "GET /v1/models missing-key contract is HTTP ${models_unauth}, expected 401"
fi

generate_unauth="$(request_status POST "${BASE_URL}/v1/generate" '{}')"
if [[ "$generate_unauth" == "401" ]]; then
  pass "POST /v1/generate rejects missing API key with HTTP 401"
elif [[ "$generate_unauth" == "404" ]]; then
  fail "POST /v1/generate is not deployed (HTTP 404)"
else
  fail "POST /v1/generate missing-key contract is HTTP ${generate_unauth}, expected 401"
fi

if [[ -z "$API_KEY" ]]; then
  warn "CORTEXIA_API_KEY is not set; authenticated API, credit and key-lifecycle checks are not run"
  warn "Create a key in /app/developers, export it only in the local shell, then rerun this script"
else
  # Never print the raw key. All authenticated responses are handled in memory or temp files.
  tmp_models="$(mktemp)"
  tmp_credits="$(mktemp)"
  trap 'rm -f "$tmp_models" "$tmp_credits"' EXIT

  if json_request GET "${BASE_URL}/v1/models" >"$tmp_models"; then
    if python3 - "$tmp_models" <<'PY'
import json
import sys
from pathlib import Path

payload = json.loads(Path(sys.argv[1]).read_text())
models = payload.get("data")
if not isinstance(models, list):
    raise SystemExit("data is not an array")
for model in models:
    if not isinstance(model, dict):
        raise SystemExit("model entry is not an object")
    for field in ("slug", "category", "price_usd", "fidelity_status"):
        if field not in model:
            raise SystemExit(f"missing model field: {field}")
    if model["fidelity_status"] != "fidele":
        raise SystemExit("API returned an unverified model")
print(len(models))
PY
    then
      model_count="$(python3 -c 'import json,sys; print(len(json.load(open(sys.argv[1]))["data"]))' "$tmp_models")"
      pass "authenticated GET /v1/models returns ${model_count} verified model(s)"
    else
      fail "authenticated GET /v1/models returned an invalid or unverified catalogue"
    fi
  else
    fail "authenticated GET /v1/models failed"
  fi

  if json_request GET "${BASE_URL}/v1/credits" >"$tmp_credits"; then
    if python3 - "$tmp_credits" <<'PY'
import json
import sys
from pathlib import Path

payload = json.loads(Path(sys.argv[1]).read_text())
credits = payload.get("credits")
if not isinstance(credits, dict) or not isinstance(credits.get("amount"), (int, float)):
    raise SystemExit("credits.amount is missing")
PY
    then
      pass "authenticated GET /v1/credits returns a numeric balance"
    else
      fail "authenticated GET /v1/credits returned an invalid balance payload"
    fi
  else
    warn "authenticated GET /v1/credits failed; confirm the endpoint is deployed before launch"
  fi

  if [[ "$MODE" == "live-generation" ]]; then
    if [[ "$LIVE_CONFIRMATION" != "I_UNDERSTAND_THIS_CHARGES" ]]; then
      fail "live generation blocked: set CORTEXIA_LIVE_CONFIRMATION=I_UNDERSTAND_THIS_CHARGES only after explicit approval"
    else
      model="${CORTEXIA_MODEL:-}"
      prompt="${CORTEXIA_PROMPT:-Cortexia smoke test — generate a minimal validation asset}"
      if [[ -z "$model" ]]; then
        fail "live generation requires CORTEXIA_MODEL set to a verified model slug"
      else
        body="$(python3 - "$model" "$prompt" <<'PY'
import json
import sys
print(json.dumps({"model": sys.argv[1], "prompt": sys.argv[2]}))
PY
)"
        response="$(json_request POST "${BASE_URL}/v1/generate" "$body" || true)"
        if python3 - "$response" <<'PY'
import json
import sys
payload = json.loads(sys.argv[1])
if not payload.get("id") or payload.get("status") not in {"processing", "queued"}:
    raise SystemExit("generation did not return a processing id")
PY
        then
          pass "live generation accepted; poll the returned generation id manually or with a separately approved run"
        else
          fail "live generation did not return the expected processing contract"
        fi
      fi
    fi
  else
    warn "live provider generation was not executed; rerun with --live-generation only after explicit confirmation"
  fi
fi

printf '\nManual browser gates (not automated by this script):\n'
printf '  1. Sign in with a dedicated test account.\n'
printf '  2. Open /app/developers and create a key named smoke-test-app.\n'
printf '  3. Confirm the raw key is shown once, copy it to a server-side shell, then close the reveal.\n'
printf '  4. Open /app/account and recharge exactly 1 USD through the intended payment rail.\n'
printf '  5. Confirm the payment provider result, the account balance increase and one purchase ledger row.\n'
printf '  6. Open /app/models, test one verified model in the playground and verify the displayed cost/result.\n'
printf '  7. Run this script with CORTEXIA_API_KEY and confirm /v1/models and /v1/credits.\n'
printf '  8. Revoke the key and confirm subsequent API calls return HTTP 401.\n'

printf '\nSummary: %d PASS, %d WARN, %d FAIL\n' "$PASS" "$WARN" "$FAIL"
if (( FAIL > 0 )); then
  exit 1
fi
