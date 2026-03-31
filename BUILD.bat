@echo off
REM ========================================
REM Employee Tracking System - Build Script
REM ========================================

cd /d "%~dp0"

echo.
echo ========================================
echo Employee Tracking System
echo Automated Build Process
echo ========================================
echo.

REM Check for Bun
echo Checking for package managers...
echo.

where bun >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [FOUND] Bun is installed
    echo Using Bun to build the project...
    echo.
    
    echo Step 1/3: Installing dependencies...
    echo ----------------------------------------
    call bun install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies with Bun
        goto :error
    )
    echo [SUCCESS] Dependencies installed
    echo.
    
    echo Step 2/3: Generating routes...
    echo ----------------------------------------
    call bun run generate:routes
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Route generation had issues
    )
    echo.
    
    echo Step 3/3: Building production bundle...
    echo ----------------------------------------
    call bun run build
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Build failed with Bun
        goto :error
    )
    
    goto :success
)

REM Check for NPM
where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [FOUND] NPM is installed
    echo Using NPM to build the project...
    echo.
    
    echo Step 1/3: Installing dependencies...
    echo ----------------------------------------
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies with NPM
        goto :error
    )
    echo [SUCCESS] Dependencies installed
    echo.
    
    echo Step 2/3: Generating routes...
    echo ----------------------------------------
    call npm run generate:routes
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Route generation had issues
    )
    echo.
    
    echo Step 3/3: Building production bundle...
    echo ----------------------------------------
    call npm run build
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Build failed with NPM
        goto :error
    )
    
    goto :success
)

REM No package manager found
echo [ERROR] No package manager found!
echo.
echo Please install one of the following:
echo.
echo 1. Bun (Recommended for this project):
echo    https://bun.sh/
echo    Run: curl -fsSL https://bun.sh/install ^| bash
echo.
echo 2. Node.js (includes NPM):
echo    https://nodejs.org/
echo    Download and install the LTS version
echo.
goto :error

:success
echo.
echo ========================================
echo [SUCCESS] BUILD COMPLETED!
echo ========================================
echo.
echo Build output location:
echo   %CD%\dist
echo.
echo Production server files:
echo   %CD%\dist\server
echo.
echo Client bundle:
echo   %CD%\dist\client
echo.
echo ----------------------------------------
echo Next Steps:
echo ----------------------------------------
echo.
echo 1. To run the production server locally:
if exist "%CD%\node_modules\.bin\bun" (
    echo    bun run start
) else (
    echo    npm run start
)
echo.
echo 2. To deploy to the web:
echo    - Follow WEB_DEPLOYMENT_COMPLETE_GUIDE.md
echo    - Use Vercel, Netlify, or Railway
echo.
echo 3. To run development mode:
if exist "%CD%\node_modules\.bin\bun" (
    echo    bun run dev
) else (
    echo    npm run dev
)
echo.
echo ========================================
echo Build completed at: %DATE% %TIME%
echo ========================================
echo.
pause
goto :end

:error
echo.
echo ========================================
echo [ERROR] BUILD FAILED!
echo ========================================
echo.
echo Please check the error messages above
echo and refer to the troubleshooting guide.
echo.
echo Common issues:
echo - Missing package manager (Bun/Node.js)
echo - Network issues during install
echo - Corrupted dependencies
echo - TypeScript errors in code
echo.
echo Need help? Check ERROR_FIXES.md
echo.
pause
exit /b 1

:end
