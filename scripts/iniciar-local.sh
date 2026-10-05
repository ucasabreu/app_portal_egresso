#!/usr/bin/env bash
# Inicializador de desenvolvimento para WSL/Linux.
set -Eeuo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_DIR="$PROJECT_DIR/.local-run"
CHECK_ONLY=0
FORCE_INSTALL=0
NO_BROWSER=0
SERVICE_PIDS=()
LOG_PID=''

fail() { printf '\nErro: %s\n' "$*" >&2; exit 1; }

for arg in "$@"; do
  case "$arg" in
    --check) CHECK_ONLY=1 ;;
    --reinstall) FORCE_INSTALL=1 ;;
    --no-browser) NO_BROWSER=1 ;;
    --help|-h)
      printf '%s\n' 'Uso: bash iniciar.sh --local [--check] [--reinstall] [--no-browser]' \
        '  --check       Verifica requisitos e dependências sem iniciar serviços.' \
        '  --reinstall   Reinstala as dependências antes de iniciar.' \
        '  --no-browser  Não abre o navegador automaticamente.'
      exit 0 ;;
    *) fail "Opção desconhecida: $arg. Use --help." ;;
  esac
done

cleanup() {
  local status=$? pid attempt alive
  trap - EXIT INT TERM HUP
  if [[ -n "$LOG_PID" ]]; then
    kill "$LOG_PID" 2>/dev/null || true
    wait "$LOG_PID" 2>/dev/null || true
  fi
  if ((${#SERVICE_PIDS[@]})); then
    printf '\nEncerrando os processos do projeto...\n'
    for pid in "${SERVICE_PIDS[@]}"; do
      kill -TERM -- "-$pid" 2>/dev/null || true
    done
    for attempt in {1..25}; do
      alive=0
      for pid in "${SERVICE_PIDS[@]}"; do
        if kill -0 -- "-$pid" 2>/dev/null; then alive=1; fi
      done
      ((alive)) || break
      sleep 0.2
    done
    for pid in "${SERVICE_PIDS[@]}"; do
      kill -KILL -- "-$pid" 2>/dev/null || true
      wait "$pid" 2>/dev/null || true
    done
  fi
  exit "$status"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM HUP

# O terminal aberto pelo Windows pode não ter carregado o NVM.
if ! command -v node >/dev/null || ! command -v npm >/dev/null; then
  if [[ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]]; then
    set +u
    source "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
    nvm use --silent default >/dev/null 2>&1 || true
    set -u
  fi
fi
for tool in java javac node npm curl setsid flock sha256sum awk sed tail; do
  command -v "$tool" >/dev/null || fail "Instale '$tool' dentro do WSL/Linux."
done
[[ "$(node -p 'process.platform')" == linux ]] || fail 'Use Node e npm instalados no Linux, não no Windows.'
java_major=$(javac -version 2>&1 | awk '{split($2, v, "."); print v[1]}')
[[ "$java_major" =~ ^[0-9]+$ ]] && ((java_major >= 17)) || fail 'É necessário um JDK 17 ou superior.'
if [[ -n "${JAVA_HOME:-}" ]]; then
  [[ -x "$JAVA_HOME/bin/java" && -x "$JAVA_HOME/bin/javac" ]] || fail 'JAVA_HOME deve apontar para um JDK instalado no Linux.'
fi

cd "$PROJECT_DIR"
if [[ ! -f .env.local && "$CHECK_ONLY" == 0 ]]; then
  (umask 077; cp .env.example .env.local)
  printf 'Criado .env.local. Sem substituições, será usado o banco local do perfil demo.\n'
fi
if [[ -f .env.local ]]; then
  # Arquivo local confiável, com atribuições Bash; nunca versionar credenciais.
  set -a
  source <(sed 's/\r$//' .env.local)
  set +a
fi
export SPRING_PROFILES_ACTIVE="${SPRING_PROFILES_ACTIVE:-demo}"
START_TIMEOUT="${TEMPO_INICIALIZACAO:-180}"
[[ "$START_TIMEOUT" =~ ^[1-9][0-9]*$ ]] || fail 'TEMPO_INICIALIZACAO deve ser um número inteiro positivo.'
[[ "${ABRIR_NAVEGADOR:-1}" =~ ^[01]$ ]] || fail 'ABRIR_NAVEGADOR deve ser 0 ou 1.'

node --input-type=module <<'JS'
import net from 'node:net';
const servers = [];
try {
  for (const port of [8080, 5173]) {
    const server = net.createServer();
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, '127.0.0.1', resolve);
    });
    servers.push(server);
  }
} catch (error) {
  const action = error.code === 'EADDRINUSE'
    ? 'Feche serviços nessas portas e tente novamente.'
    : 'Verifique se o ambiente permite abrir portas locais.';
  console.error(`Não foi possível reservar as portas 8080 e 5173: ${error.code}. ${action}`);
  process.exitCode = 1;
} finally {
  for (const server of servers) server.close();
}
JS

dependencies_ok() {
  (cd "$PROJECT_DIR/frontend" && node --input-type=module -e \
    'await import("vite"); await import("rollup"); await import("styled-components");' >/dev/null 2>&1)
}
dependency_hash=$(cd frontend && sha256sum package.json package-lock.json)
if ((CHECK_ONLY)); then
  printf 'Java, Node, npm e portas: OK.\n'
  dependencies_ok || fail 'Dependências do frontend ausentes ou incompatíveis. Execute bash iniciar.sh --local para reinstalar.'
  printf 'Dependências do frontend: OK. O acesso ao banco será verificado durante a inicialização.\n'
  exit 0
fi

mkdir -p "$RUN_DIR"
exec 9>"$RUN_DIR/iniciar.lock"
flock -n 9 || fail 'Outro inicializador já está em execução neste projeto.'

launch() {
  local directory=$1 logfile=$2
  shift 2
  setsid bash -c 'cd -- "$1"; shift; exec "$@"' _ "$directory" "$@" >"$logfile" 2>&1 &
  LAST_PID=$!
  SERVICE_PIDS+=("$LAST_PID")
}

if ((FORCE_INSTALL)) || ! dependencies_ok || [[ ! -f "$RUN_DIR/dependencies.sha256" ]] || \
    [[ "$(cat "$RUN_DIR/dependencies.sha256")" != "$dependency_hash" ]]; then
  printf 'Instalando dependências Linux do frontend (pode precisar de internet)...\n'
  launch "$PROJECT_DIR/frontend" "$RUN_DIR/install.log" \
    npm ci --include=optional --cache "$RUN_DIR/npm-cache" --fetch-retries=1 --fetch-timeout=30000
  wait "$LAST_PID" || fail "Não foi possível instalar as dependências. Consulte $RUN_DIR/install.log e verifique o acesso ao registro npm."
  dependencies_ok || fail "Instalação incompatível. Consulte $RUN_DIR/install.log."
  printf '%s\n' "$dependency_hash" >"$RUN_DIR/dependencies.sha256"
fi

wait_http() {
  local name=$1 url=$2 pid=$3 logfile=$4 code deadline=$((SECONDS + START_TIMEOUT))
  while ((SECONDS < deadline)); do
    kill -0 "$pid" 2>/dev/null || fail "$name encerrou antes de iniciar. Consulte $logfile. Para o backend, verifique o banco e .env.local."
    code=$(curl --noproxy '*' -s -o /dev/null -w '%{http_code}' --connect-timeout 1 --max-time 2 "$url" || true)
    # A API responde 400 quando a consulta funciona, mas o banco não tem cursos.
    if [[ "$code" == 200 || ("$name" == Backend && "$code" == 400) ]]; then return 0; fi
    if [[ "$code" == 500 && "$name" == Backend ]]; then
      fail "A API iniciou, mas a consulta ao banco falhou. Verifique conexão e tabelas em .env.local. Consulte $logfile."
    fi
    sleep 1
  done
  fail "$name não respondeu em $START_TIMEOUT segundos. Consulte $logfile."
}

printf 'Iniciando backend em http://localhost:8080...\n'
launch "$PROJECT_DIR/backend" "$RUN_DIR/backend.log" bash ./mvnw spring-boot:run \
  '-Dspring-boot.run.arguments=--server.port=8080 --server.address=127.0.0.1'
BACKEND_PID=$LAST_PID
wait_http Backend 'http://127.0.0.1:8080/api/consultas/listar/cursos' "$BACKEND_PID" "$RUN_DIR/backend.log"

printf 'Iniciando frontend em http://localhost:5173...\n'
launch "$PROJECT_DIR/frontend" "$RUN_DIR/frontend.log" npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
FRONTEND_PID=$LAST_PID
wait_http Frontend 'http://127.0.0.1:5173/' "$FRONTEND_PID" "$RUN_DIR/frontend.log"

printf '\nProjeto disponível em http://localhost:5173\nAPI: http://localhost:8080\nLogs: %s\nPressione Ctrl+C para encerrar os dois serviços.\n\n' "$RUN_DIR"
if ((NO_BROWSER == 0)) && [[ "${ABRIR_NAVEGADOR:-1}" == 1 ]]; then
  if command -v powershell.exe >/dev/null; then
    powershell.exe -NoProfile -NonInteractive -Command "Start-Process 'http://localhost:5173'" >/dev/null 2>&1 || true
  elif command -v xdg-open >/dev/null; then
    xdg-open 'http://localhost:5173' >/dev/null 2>&1 || true
  fi
fi
tail -n 10 -f "$RUN_DIR/backend.log" "$RUN_DIR/frontend.log" &
LOG_PID=$!
while kill -0 "$BACKEND_PID" 2>/dev/null && kill -0 "$FRONTEND_PID" 2>/dev/null; do
  sleep 1
done
fail "Um dos serviços encerrou. Consulte os logs em $RUN_DIR."
