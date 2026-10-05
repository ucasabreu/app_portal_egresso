param([switch]$Check, [switch]$NoBrowser, [switch]$Reinstall)
$ErrorActionPreference = 'Stop'
$ProjectDirectory = Split-Path -Parent $PSScriptRoot
$ComposeArguments = @('compose', '--project-directory', $ProjectDirectory, '-f', (Join-Path $ProjectDirectory 'compose.yaml'))
$Started = $false
try {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        throw 'Instale Docker Desktop com Compose antes de iniciar.'
    }
    & docker @ComposeArguments config --quiet
    if ($LASTEXITCODE -ne 0) { throw 'A configuração do Compose não pôde ser validada.' }
    & docker info *> $null
    if ($LASTEXITCODE -ne 0) { throw 'Inicie Docker Desktop antes de abrir o projeto.' }
    if ($Check) { Write-Host 'Configuração e serviço Docker: OK.'; exit 0 }
    if ($Reinstall) {
        & docker @ComposeArguments build --no-cache
        if ($LASTEXITCODE -ne 0) { throw 'A reconstrução das imagens falhou.' }
    }
    $Started = $true
    & docker @ComposeArguments up --build -d --wait --wait-timeout 240
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao iniciar. Consulte docker compose logs.' }
    Write-Host 'Portal: http://localhost:5173'
    Write-Host 'Contas: admin.demo ou coord.demo / senha demo123'
    Write-Host 'Ctrl+C encerra os serviços e preserva os dados.'
    if (-not $NoBrowser) { Start-Process 'http://localhost:5173' }
    & docker @ComposeArguments logs --follow
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
} finally {
    if ($Started) { & docker @ComposeArguments stop }
}
