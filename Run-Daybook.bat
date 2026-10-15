@echo off
setlocal
cd /d "%~dp0"
title Run Daybook Desktop
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install Node.js LTS from https://nodejs.org/en/download
  pause
  exit /b 1
)
if not exist "node_modules\electron\dist\electron.exe" (
  echo Dependencies are not installed yet.
  echo Double-click Build-Daybook.bat first, or run npm install in this folder.
  pause
  exit /b 1
)
call npm start
if errorlevel 1 pause
