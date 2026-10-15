@echo off
setlocal
cd /d "%~dp0"
title Build Daybook Desktop

echo ========================================
echo       DAYBOOK DESKTOP - BUILD TOOL
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js is not installed or is not on PATH.
  echo Install the current Node.js LTS release from:
  echo https://nodejs.org/en/download
  echo Then close and reopen this window and double-click this file again.
  echo.
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo ERROR: npm was not found. Reinstall Node.js LTS and try again.
  echo.
  pause
  exit /b 1
)

echo [1/3] Detected Node.js:
node -v
echo [2/3] Installing project dependencies. Internet is required on first run...
call npm install
if errorlevel 1 goto :failed

echo.
echo [3/3] Building the Windows installer...
call npm run dist:win
if errorlevel 1 goto :failed

echo.
echo SUCCESS: Build completed.
echo Look in the release folder for the Daybook Setup installer.
echo Opening release folder...
if exist "release" start "" explorer "%~dp0release"
echo.
echo Note: Install and smoke-test the app on this laptop before relying on it.
pause
exit /b 0

:failed
echo.
echo BUILD FAILED. Read the error above, check your internet connection,
echo then try double-clicking Build-Daybook.bat again.
echo If it fails again, copy the full error text and ask for help.
echo.
pause
exit /b 1
