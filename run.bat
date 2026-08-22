@echo off
title PROVEXA Launcher
echo ===================================================
echo   🛡️ PROVEXA - Authenticity Validator for Academia
echo ===================================================
echo.
echo [1/2] Launching Backend API Server (Port 5000)...
start "PROVEXA Backend" cmd /k "cd /d \"%~dp0server\" && npm run dev"

echo [2/2] Launching Frontend React Client (Port 5173)...
start "PROVEXA Client" cmd /k "cd /d \"%~dp0client\" && npm run dev"

echo.
echo 🚀 Both servers have been launched in separate windows!
echo.
echo - Backend:  http://localhost:5000
echo - Frontend: http://localhost:5173
echo.
echo Close the newly opened terminal windows to stop the servers.
echo ===================================================
pause
