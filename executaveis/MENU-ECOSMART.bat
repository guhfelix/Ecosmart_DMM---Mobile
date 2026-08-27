@echo off
chcp 65001 > nul
title EcoSmart Mobile - Painel Principal
color 0A

:menu
cls
echo ================================================================
echo               ECOSMART MOBILE - PAINEL PRINCIPAL
echo ================================================================
echo.
echo   [1] Instalar todas as dependencias (Monorepo + Apps)
echo   [2] Executar testes automatizados e checagem de tipos
echo   [3] Executar teste de comunicacao (API Backend + Firebase)
echo   [4] Iniciar EcoSmart Cidadao (Porta 8081)
echo   [5] Iniciar EcoSmart Coletor (Porta 8082)
echo   [6] Iniciar EcoSmart Admin   (Porta 8083)
echo   [7] Iniciar Servidor Central Backend (Porta 3333)
echo   [8] Sincronizar modulos compartilhados (shared)
echo   [9] Publicar regras no Firebase (firebase deploy)
echo   [0] Sair
echo.
echo ================================================================
set /p opcao="Escolha uma opcao [0-9]: "

if "%opcao%"=="1" goto instalar
if "%opcao%"=="2" goto testar
if "%opcao%"=="3" goto comunicacao
if "%opcao%"=="4" goto cidadao
if "%opcao%"=="5" goto coletor
if "%opcao%"=="6" goto admin
if "%opcao%"=="7" goto servidor
if "%opcao%"=="8" goto sync
if "%opcao%"=="9" goto firebase
if "%opcao%"=="0" goto sair

echo [Opcao invalida!] Pressione qualquer tecla para tentar novamente...
pause > nul
goto menu

:instalar
cls
call "%~dp0\1-instalar-dependencias.bat"
goto menu

:testar
cls
call "%~dp0\2-executar-testes.bat"
goto menu

:comunicacao
cls
call "%~dp0\7-testar-comunicacao.bat"
goto menu

:cidadao
cls
start "EcoSmart Cidadao (8081)" cmd /k call "%~dp0\3-iniciar-cidadao.bat"
goto menu

:coletor
cls
start "EcoSmart Coletor (8082)" cmd /k call "%~dp0\4-iniciar-coletor.bat"
goto menu

:admin
cls
start "EcoSmart Admin (8083)" cmd /k call "%~dp0\5-iniciar-admin.bat"
goto menu

:servidor
cls
start "Servidor Backend EcoSmart (3333)" cmd /k call "%~dp0\8-iniciar-servidor.bat"
goto menu

:sync
cls
call "%~dp0\6-sincronizar-modulos.bat"
goto menu

:firebase
cls
echo ================================================================
echo            PUBLICANDO REGRAS NO FIREBASE
echo ================================================================
cd /d "%~dp0\.."
call firebase deploy --project ecosmart-mobile
echo.
pause
goto menu

:sair
echo.
echo Saindo do EcoSmart Mobile...
exit /b 0
