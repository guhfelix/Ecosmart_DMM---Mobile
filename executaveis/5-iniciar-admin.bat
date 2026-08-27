@echo off
chcp 65001 > nul
title EcoSmart Admin - Expo Dev Server (Porta 8083)
color 05

echo ================================================================
echo        ECOSMART ADMIN - INICIANDO APLICATIVO
echo ================================================================
echo.
echo  Porta: 8083
echo  Perfil: Administrador / Gestao ESG
echo  Modo: Expo Development Server
echo.

cd /d "%~dp0\.."

echo [1/3] Sincronizando modulos compartilhados (shared)...
call npm run sync:shared

echo [2/3] Garantindo Servidor Backend e Conexao Firebase...
call node scripts/ensure-server.js

echo [3/3] Iniciando Expo Dev Server na porta 8083...
cd "frontend\ecosmart-admin"
call npx expo start --port 8083
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Ocorreu uma falha ao iniciar o EcoSmart Admin.
    pause
)
