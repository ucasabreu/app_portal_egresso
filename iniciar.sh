#!/usr/bin/env bash
set -euo pipefail
PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
LOCAL=0
CHECK=0
REINSTALL=0
NO_BROWSER=0
ARGS=("$@")
for arg in "$@"; do
  case "$arg" in
    --local) LOCAL=1 ;;
    --check) CHECK=1 ;;
    --reinstall) REINSTALL=1 ;;
    --no-browser) NO_BROWSER=1 ;;
    --help|-h)
      printf '%s\n' 'Uso: bash iniciar.sh [--local] [--check] [--reinstall] [--no-browser]' \
        'Sem --local: inicia a demonstração pelo Docker Compose (Linux, macOS ou WSL).' \
        '--local: usa Java e Node instalados no WSL/Linux e o banco configurado em .env.local.'
      exit 0 ;;
    *) printf 'Opção desconhecida: %s\n' "$arg" >&2; exit 1 ;;
  esac
done
if ((LOCAL)); then
  LOCAL_ARGS=()
  for arg in "${ARGS[@]}"; do
    [[ "$arg" == --local ]] || LOCAL_ARGS+=("$arg")
  done
  exec bash "$PROJECT_DIR/scripts/iniciar-local.sh" "${LOCAL_ARGS[@]}"
fi
command -v docker >/dev/null || { printf 'Instale Docker com Compose antes de iniciar.\n' >&2; exit 1; }
COMPOSE=(docker compose --project-directory "$PROJECT_DIR" -f "$PROJECT_DIR/compose.yaml")
"${COMPOSE[@]}" config --quiet
docker info >/dev/null 2>&1 || { printf 'Docker não está acessível. Inicie Docker Desktop ou o serviço Docker.\n' >&2; exit 1; }
if ((CHECK)); then printf 'Configuração e serviço Docker: OK.\n'; exit 0; fi
STARTED=0
cleanup() {
  status=$?
  trap - EXIT INT TERM HUP
  if ((STARTED)); then
    printf '\nParando a demonstração; os dados ficam preservados.\n'
    "${COMPOSE[@]}" stop || true
  fi
  exit "$status"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM HUP
if ((REINSTALL)); then "${COMPOSE[@]}" build --no-cache; fi
STARTED=1
"${COMPOSE[@]}" up --build -d --wait --wait-timeout 240
FRONTEND_ADDRESS=$("${COMPOSE[@]}" port frontend 80)
if [[ ! "$FRONTEND_ADDRESS" =~ ^127\.0\.0\.1:([0-9]+)$ ]]; then
  printf 'Não foi possível identificar a porta publicada do frontend. Consulte docker compose ps.\n' >&2
  exit 1
fi
PORTAL_URL="http://localhost:${BASH_REMATCH[1]}"
printf '\nPortal: %s\nContas: admin.demo ou coord.demo / senha demo123\nCtrl+C encerra os serviços e preserva os dados.\n' "$PORTAL_URL"
if ((NO_BROWSER == 0)); then
  if command -v powershell.exe >/dev/null; then
    powershell.exe -NoProfile -NonInteractive -Command "Start-Process '$PORTAL_URL'" >/dev/null 2>&1 || true
  elif command -v xdg-open >/dev/null; then
    xdg-open "$PORTAL_URL" >/dev/null 2>&1 || true
  elif command -v open >/dev/null; then
    open "$PORTAL_URL" >/dev/null 2>&1 || true
  fi
fi
"${COMPOSE[@]}" logs --follow
