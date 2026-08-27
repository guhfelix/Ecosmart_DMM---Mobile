@echo off
chcp 65001 > nul
title EcoSmart Mobile - Servidor Central Backend (Porta 3333)
color 0E

echo ================================================================
echo        ECOSMART MOBILE - SERVIDOR CENTRAL BACKEND
echo ================================================================
echo.
echo  Porta: 3333
echo  URL: http://localhost:3333
echo  Endpoints: /api/discards, /api/users, /api/admin, /api/health
echo.

cd /d "%~dp0\.."

call npm run server
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Ocorreu uma falha no servidor central.
    pause
)
