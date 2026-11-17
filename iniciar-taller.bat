@echo off
chcp 65001 >nul
title Ecobot Cobra Vida - Servidor del taller
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Falta instalar Node.js en este computador.
  echo   Descargalo gratis en https://nodejs.org  (version LTS), instalalo y vuelve a abrir este archivo.
  echo.
  pause
  exit /b
)
start "" "http://localhost:8080/admin.html"
node servidor.js
pause
