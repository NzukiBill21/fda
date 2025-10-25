@echo off
echo.
echo ========================================
echo   FOOD DELIVERY APP - QUICK START
echo ========================================
echo.
echo Choose an option:
echo.
echo [1] Complete Setup (First time only)
echo [2] Start App (After setup is done)
echo [3] Exit
echo.
set /p choice="Enter your choice (1, 2, or 3): "

if "%choice%"=="1" (
    echo.
    echo Running complete setup...
    powershell -ExecutionPolicy Bypass -File "%~dp0setup.ps1"
    echo.
    echo Press any key to continue...
    pause >nul
) else if "%choice%"=="2" (
    echo.
    echo Starting app...
    powershell -ExecutionPolicy Bypass -File "%~dp0start.ps1"
) else if "%choice%"=="3" (
    exit
) else (
    echo Invalid choice. Please run again and choose 1, 2, or 3.
    pause
)

