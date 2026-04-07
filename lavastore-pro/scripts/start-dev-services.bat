@echo off
:: Executar como Administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Solicitando privilegios de administrador...
    powershell -Command "Start-Process '%0' -Verb RunAs"
    exit /b
)

echo ===================================================
echo    LavaStore Pro - Iniciando servicos Docker
echo ===================================================
echo.

:: Iniciar servico Docker
sc start com.docker.service
if %errorLevel% equ 0 (
    echo [OK] Servico Docker iniciado!
) else (
    echo [INFO] Servico pode ja estar rodando ou iniciando via Docker Desktop
)

:: Aguardar Docker Desktop
echo.
echo Aguardando Docker Desktop inicializar (30s)...
timeout /t 30 /nobreak

:: Testar Docker
docker ps >nul 2>&1
if %errorLevel% equ 0 (
    echo [OK] Docker engine pronto!
) else (
    echo [AVISO] Docker ainda inicializando. Aguarde mais alguns segundos.
)

echo.
echo ===================================================
echo    Iniciando containers do LavaStore Pro...
echo ===================================================

:: Navegar para o diretorio do projeto
cd /d "d:\TRABALHO\ORBITA SOLUTIONS\Projetos\topflex\stitch_topflex\lavastore-pro"

:: Subir apenas postgres + redis + adminer
docker compose up postgres redis adminer -d

if %errorLevel% equ 0 (
    echo.
    echo [OK] Containers iniciados com sucesso!
    echo.
    echo Servicos disponíveis:
    echo   - PostgreSQL: localhost:5432
    echo   - Redis:      localhost:6379
    echo   - Adminer:    http://localhost:8080
    echo.
    echo Proximo passo: executar a migration do Prisma
    echo   pnpm --filter api prisma:migrate
    echo.
) else (
    echo [ERRO] Falha ao iniciar containers. Verifique o Docker Desktop.
)

pause
