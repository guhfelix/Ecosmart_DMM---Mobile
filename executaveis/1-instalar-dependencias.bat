@echo off
chcp 65001 > nul
title EcoSmart Mobile - Instalador de Dependencias
color 0A

echo ================================================================
echo        ECOSMART MOBILE - INSTALACAO DE DEPENDENCIAS
echo ================================================================
echo.

cd /d "%~dp0\.."

echo [1/6] Instalando dependencias da raiz do monorepo...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar dependencias da raiz.
    goto erro
)

echo.
echo [2/6] Instalando dependencias do EcoSmart Cidadao...
cd "frontend\ecosmart-cidadao"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar dependencias do Cidadao.
    goto erro
)

echo.
echo [3/6] Instalando dependencias do EcoSmart Coletor...
cd "..\ecosmart-coletor"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar dependencias do Coletor.
    goto erro
)

echo.
echo [4/6] Instalando dependencias do EcoSmart Admin...
cd "..\ecosmart-admin"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar dependencias do Admin.
    goto erro
)

echo.
echo [5/6] Instalando dependencias do Backend Modular (backend)...
cd "..\..\backend"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar dependencias do Backend.
    goto erro
)

echo.
echo [6/6] Sincronizando modulos compartilhados (shared)...
cd ".."
call npm run sync:shared
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao sincronizar modulos compartilhados.
    goto erro
)

echo.
echo ================================================================
echo    [SUCESSO] Todas as dependencias foram instaladas!
echo ================================================================
echo.
pause
exit /b 0

:erro
echo.
echo ================================================================
echo    [FALHA] Ocorreu um erro durante a instalacao.
echo ================================================================
echo.
pause
exit /b 1
