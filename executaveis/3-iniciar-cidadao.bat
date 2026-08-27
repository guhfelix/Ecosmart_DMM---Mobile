@echo off
chcp 65001 > nul
title EcoSmart Cidadao - Expo Dev Server (Porta 8081)
color 02

echo ================================================================
echo        ECOSMART CIDADAO - INICIANDO APLICATIVO
echo ================================================================
echo.
echo  Porta: 8081
echo  Perfil: Cidadao
echo  Modo: Expo Development Server
echo.

cd /d "%~dp0\.."

echo [1/3] Sincronizando modulos compartilhados (shared)...
call npm run sync:shared

echo [2/3] Garantindo Servidor Backend e Conexao Firebase...
call node scripts/ensure-server.js

echo [3/3] Iniciando Expo Dev Server na porta 8081...
cd "frontend\ecosmart-cidadao"
call npx expo start --port 8081
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Ocorreu uma falha ao iniciar o EcoSmart Cidadao.
    pause
)
