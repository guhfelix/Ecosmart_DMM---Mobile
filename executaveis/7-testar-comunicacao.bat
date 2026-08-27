@echo off
chcp 65001 > nul
title EcoSmart Mobile - Diagnostico e Teste de Comunicacao
color 0A

echo ================================================================
echo        ECOSMART MOBILE - TESTE DE COMUNICACAO E SYNC
echo ================================================================
echo.

cd /d "%~dp0\.."

echo [1/2] Sincronizando modulos compartilhados (shared)...
call npm run sync:shared

echo.
echo [2/2] Executando diagnostico da API Backend, Firebase e Storage...
call npm run test:communication

echo.
pause
