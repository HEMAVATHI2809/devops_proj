#!/usr/bin/env bash
# Remote deployment helper: pull tagged images, recreate stack, verify health, rollback on failure.
# Required env: DEPLOY_PATH (absolute path to project on server), IMAGE_TAG (e.g. commit SHA).
# Optional: COMPOSE_FILE (default docker-compose.yml), FRONTEND_IMAGE, BACKEND_IMAGE, MONGO_URI, etc. via .env in DEPLOY_PATH.
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
DEPLOY_PATH="${DEPLOY_PATH:?DEPLOY_PATH must be set to the compose project directory}"
NEW_TAG="${IMAGE_TAG:?IMAGE_TAG must be set (e.g. github.sha)}"
STATE_FILE="${DEPLOY_PATH}/.deployment-image-tag"

cd "$DEPLOY_PATH"

if [[ -f "${DEPLOY_PATH}/.env" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${DEPLOY_PATH}/.env"
  set +a
fi

# Last known-good tag for rollback (before this deploy bumps it).
previous_tag="latest"
if [[ -f "$STATE_FILE" ]]; then
  previous_tag="$(tr -d '[:space:]' <"$STATE_FILE" || true)"
fi
if [[ -z "${previous_tag}" ]]; then
  previous_tag="latest"
fi

wait_for_healthy() {
  local deadline=$((SECONDS + 180))
  local cid status
  while (( SECONDS < deadline )); do
    local all_ok=1
    for svc in mongo backend frontend; do
      cid="$(docker compose -f "$COMPOSE_FILE" ps -q "$svc" 2>/dev/null || true)"
      if [[ -z "$cid" ]]; then
        all_ok=0
        break
      fi
      status="$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}unknown{{end}}' "$cid" 2>/dev/null || echo unknown)"
      if [[ "$status" != "healthy" ]]; then
        all_ok=0
        break
      fi
    done
    if (( all_ok )); then
      return 0
    fi
    sleep 3
  done
  return 1
}

echo "Deploying IMAGE_TAG=${NEW_TAG} (rollback target: ${previous_tag})"
export IMAGE_TAG="${NEW_TAG}"

if ! docker compose -f "$COMPOSE_FILE" pull frontend backend; then
  echo "docker compose pull failed" >&2
  exit 1
fi

if ! docker compose -f "$COMPOSE_FILE" up -d --no-build --remove-orphans; then
  echo "docker compose up failed before health verification" >&2
  exit 1
fi

if ! wait_for_healthy; then
  echo "Health checks failed for new revision; rolling back to IMAGE_TAG=${previous_tag}" >&2
  export IMAGE_TAG="${previous_tag}"
  docker compose -f "$COMPOSE_FILE" pull frontend backend || true
  if ! docker compose -f "$COMPOSE_FILE" up -d --no-build --remove-orphans; then
    echo "Rollback up failed" >&2
    exit 1
  fi
  if ! wait_for_healthy; then
    echo "Rollback revision is also unhealthy — manual intervention required" >&2
    exit 1
  fi
  exit 1
fi

printf '%s\n' "${NEW_TAG}" >"${STATE_FILE}.tmp"
mv "${STATE_FILE}.tmp" "${STATE_FILE}"
echo "Deploy successful; recorded IMAGE_TAG=${NEW_TAG}"
