@echo off
setlocal
title Portal de Egressos - Demonstracao
if "%~1"=="--local" (
  where wsl.exe >nul 2>&1
  if errorlevel 1 (
    echo A alternativa local exige WSL com Java e Node instalados.
    pause
    exit /b 1
  )
  if defined PORTAL_WSL_DISTRO (
    wsl.exe --distribution "%PORTAL_WSL_DISTRO%" --cd "%~dp0." --exec bash ./iniciar.sh %*
  ) else (
    wsl.exe --cd "%~dp0." --exec bash ./iniciar.sh %*
  )
) else (
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\iniciar-demo.ps1" %*
)
set "PORTAL_EXIT_CODE=%ERRORLEVEL%"
if not "%PORTAL_EXIT_CODE%"=="0" (
  echo.
  echo Confira a mensagem acima e consulte o README.md.
  pause
)
exit /b %PORTAL_EXIT_CODE%
