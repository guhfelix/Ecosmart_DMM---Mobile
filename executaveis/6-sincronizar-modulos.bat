@echo off
chcp 65001 > nul
title EcoSmart Mobile - Sincronizacao de Modulos Shared
color 0E

echo ================================================================
echo        ECOSMART MOBILE - SINCRONIZACAO MONOREPO
echo ================================================================
echo.

cd /d "%~dp0\.."

echo Propagando modelos, servicos e componentes de shared/ para os 3 apps...
call npm run sync:shared

echo.
pause
