@echo off
echo ========================================
echo Building Employee Tracking System
echo ========================================
echo.

echo Step 1: Checking dependencies...
echo.

REM Check if bun is available
where bun >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Bun is installed
    echo.
    echo Step 2: Installing dependencies with Bun...
    bun install
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo [SUCCESS] Dependencies installed
        echo.
        echo Step 3: Building project...
        bun run build
        if %ERRORLEVEL% EQU 0 (
            echo.
            echo ========================================
            echo [SUCCESS] Build completed successfully!
            echo ========================================
            echo.
            echo Build output is in the 'dist' folder
            echo.
            echo To run the production server:
            echo   bun run start
            echo.
            echo To run development server:
            echo   bun run dev
            echo.
        ) else (
            echo.
            echo [ERROR] Build failed!
            echo Please check the errors above.
        )
    ) else (
        echo.
        echo [ERROR] Failed to install dependencies
    )
    goto :end
)

REM Check if npm is available
where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] NPM is installed
    echo.
    echo Step 2: Installing dependencies with NPM...
    npm install
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo [SUCCESS] Dependencies installed
        echo.
        echo Step 3: Building project...
        npm run build
        if %ERRORLEVEL% EQU 0 (
            echo.
            echo ========================================
            echo [SUCCESS] Build completed successfully!
            echo ========================================
            echo.
            echo Build output is in the 'dist' folder
            echo.
            echo To run the production server:
            echo   npm run start
            echo.
            echo To run development server:
            echo   npm run dev
            echo.
        ) else (
            echo.
            echo [ERROR] Build failed!
            echo Please check the errors above.
        )
    ) else (
        echo.
        echo [ERROR] Failed to install dependencies
    )
    goto :end
)

echo [ERROR] Neither Bun nor NPM is installed!
echo.
echo Please install one of the following:
echo.
echo 1. Bun (recommended): https://bun.sh/
echo 2. Node.js (includes NPM): https://nodejs.org/
echo.

:end
pause
