@echo off
setlocal

rem Autostart Decizyon Ticket Flow (deps + DB + dev server)

set "PROJECT_DIR=%~dp0"
set "LOG=%PROJECT_DIR%start-ticket-flow.log"
set "NODE_PORT=3001"

echo === %date% %time% === > "%LOG%"
echo Iniciando setup... >> "%LOG%"

rem Preferir Node portátil se existir
if exist "%PROJECT_DIR%tools\node-v20.11.1-win-x64\node.exe" (
  set "PORTABLE_BIN=%PROJECT_DIR%tools\node-v20.11.1-win-x64"
  set "PATH=%PORTABLE_BIN%;%PATH%"
  set "PNPM_BIN=%PORTABLE_BIN%\pnpm.cmd"
  set "NODE_BIN=%PORTABLE_BIN%\node.exe"
) else (
  set "PNPM_BIN=pnpm"
  set "NODE_BIN=node"
)

rem Garantir pnpm presente
where "%PNPM_BIN%" >nul 2>&1
if errorlevel 1 (
  echo [ERRO] pnpm nao encontrado. Instale Node.js LTS e pnpm. >> "%LOG%"
  echo pnpm nao encontrado. Veja o log em %LOG%.
  pause
  exit /b 1
)

rem Liberar porta 3001 se estiver em uso
for /f "tokens=5" %%a in ('netstat -ano ^| find ":3001" ^| find "LISTENING"') do (
  echo Matando processo na porta 3001 (PID %%a) >> "%LOG%"
  taskkill /PID %%a /F >nul 2>&1
)

rem Instalar dependencias (somente se node_modules ausente)
if not exist "%PROJECT_DIR%node_modules" (
  echo Instalando dependencias... >> "%LOG%"
  "%PNPM_BIN%" install >> "%LOG%" 2>&1
  if errorlevel 1 goto fail
)

rem Subir Postgres via Docker Compose
echo Subindo Postgres (docker compose up -d)... >> "%LOG%"
"%PNPM_BIN%" db:up >> "%LOG%" 2>&1
if errorlevel 1 goto fail

rem Migra e seed
echo Aplicando migracoes... >> "%LOG%"
"%PNPM_BIN%" prisma migrate deploy >> "%LOG%" 2>&1
if errorlevel 1 goto fail

echo Rodando seed... >> "%LOG%"
"%PNPM_BIN%" db:seed >> "%LOG%" 2>&1
if errorlevel 1 goto fail

rem Iniciar servidor dev em nova janela
echo Iniciando dev server em http://localhost:%NODE_PORT% ... >> "%LOG%"
start "ticketflow-dev" cmd /k "cd /d \"%PROJECT_DIR%\" && set PATH=%PATH% && \"%PNPM_BIN%\" dev -p %NODE_PORT%"

echo Pronto! Log em %LOG%
exit /b 0

:fail
echo Houve erro. Confira %LOG%
pause
exit /b 1
