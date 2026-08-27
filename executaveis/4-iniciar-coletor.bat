@echo off
chcp 65001 > nul
title EcoSmart Coletor - Expo Dev Server (Porta 8082)
color 03

echo ================================================================
echo        ECOSMART COLETOR - INICIANDO APLICATIVO
echo ================================================================
echo.
echo  Porta: 8082
echo  Perfil: Coletor / Cooperativa / Empresa
echo  Modo: Expo Development Server
echo.

cd /d "%~dp0\.."

echo [1/3] Sincronizando modulos compartilhados (shared)...
call npm run sync:shared

echo [2/3] Garantindo Servidor Backend e Conexao Firebase...
call node scripts/ensure-server.js

echo [3/3] Iniciando Expo Dev Server na porta 8082...
cd "frontend\ecosmart-coletor"
call npx expo start --port 8082
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Ocorreu uma falha ao iniciar o EcoSmart Coletor.
    pause
)
