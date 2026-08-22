@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "COMPOSE_FILE=%ROOT_DIR%docker-compose.yml"

if not exist "%COMPOSE_FILE%" (
  echo [ERRO] Arquivo docker-compose.yml nao encontrado em:
  echo        %COMPOSE_FILE%
  exit /b 1
)

set "ACTION=%~1"
set "TARGET=%~2"

if "%ACTION%"=="" goto :usage
if /I "%ACTION%"=="help" goto :usage
if /I "%ACTION%"=="up" goto :up
if /I "%ACTION%"=="up-build" goto :upbuild
if /I "%ACTION%"=="down" goto :down
if /I "%ACTION%"=="build" goto :build
if /I "%ACTION%"=="restart" goto :restart
if /I "%ACTION%"=="logs" goto :logs
if /I "%ACTION%"=="ps" goto :ps
if /I "%ACTION%"=="pull" goto :pull
if /I "%ACTION%"=="clean" goto :clean

echo [ERRO] Comando invalido: %ACTION%
echo.
goto :usage

:up
docker compose -f "%COMPOSE_FILE%" up -d
exit /b %errorlevel%

:upbuild
docker compose -f "%COMPOSE_FILE%" up -d --build
exit /b %errorlevel%

:down
docker compose -f "%COMPOSE_FILE%" down
exit /b %errorlevel%

:build
if "%TARGET%"=="" (
  docker compose -f "%COMPOSE_FILE%" build
) else (
  docker compose -f "%COMPOSE_FILE%" build %TARGET%
)
exit /b %errorlevel%

:restart
if "%TARGET%"=="" (
  docker compose -f "%COMPOSE_FILE%" restart
) else (
  docker compose -f "%COMPOSE_FILE%" restart %TARGET%
)
exit /b %errorlevel%

:logs
if "%TARGET%"=="" (
  docker compose -f "%COMPOSE_FILE%" logs --tail 200
) else (
  docker compose -f "%COMPOSE_FILE%" logs --tail 200 %TARGET%
)
exit /b %errorlevel%

:ps
docker compose -f "%COMPOSE_FILE%" ps
exit /b %errorlevel%

:pull
docker compose -f "%COMPOSE_FILE%" pull
exit /b %errorlevel%

:clean
docker compose -f "%COMPOSE_FILE%" down -v --remove-orphans
exit /b %errorlevel%

:usage
echo.
echo Uso: docker-projetos.bat ^<comando^> [servico]
echo.
echo Comandos:
echo   up             - sobe os containers em background
echo   up-build       - sobe os containers rebuildando imagens
echo   down           - para e remove containers/rede
echo   build          - builda tudo ou um servico ^(ex: build motor^)
echo   restart        - reinicia tudo ou um servico ^(ex: restart motor^)
echo   logs           - acompanha logs de tudo ou um servico ^(ex: logs postgres^)
echo   ps             - lista status dos servicos
echo   pull           - atualiza imagens externas ^(ex: postgres^)
echo   clean          - derruba tudo e remove volumes
echo   help           - mostra esta ajuda
echo.
echo Servicos disponiveis:
echo   postgres, motor, backend-ferias, frontend-ferias
echo.
echo Exemplos:
echo   docker-projetos.bat up-build
echo   docker-projetos.bat logs motor
echo   docker-projetos.bat restart backend-ferias
echo.
exit /b 0
