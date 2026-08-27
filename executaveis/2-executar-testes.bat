@echo off
chcp 65001 > nul
title EcoSmart Mobile - Execucao de Testes e Checagem de Tipos
color 0B

echo ================================================================
echo        ECOSMART MOBILE - SUITE DE TESTES E QUALIDADE
echo ================================================================
echo.

cd /d "%~dp0\.."

echo [1/4] Sincronizando modulos compartilhados (shared)...
call npm run sync:shared
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha na sincronizacao.
    goto erro
)

echo.
echo [2/4] Executando checagem estrita de tipos TypeScript (typecheck:all)...
call npm run typecheck:all
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha na checagem de tipos.
    goto erro
)

echo.
echo [3/4] Executando suites de testes Jest (test:all)...
call npm run test:all
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Alguns testes falharam.
    goto erro
)

echo.
echo [4/4] Executando teste de comunicacao e sincronizacao (test:communication)...
call npm run test:communication
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha no teste de comunicacao.
    goto erro
)

echo.
echo ================================================================
echo    [SUCESSO] 100%% dos testes, tipagens e comunicacao validados!
echo ================================================================
echo.
pause
exit /b 0

:erro
echo.
echo ================================================================
echo    [FALHA] Testes ou verificacao de tipos falharam.
echo ================================================================
echo.
pause
exit /b 1
