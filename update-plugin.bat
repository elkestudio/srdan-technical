@echo off
setlocal enabledelayedexpansion

echo 🔋 Elke Battery Plugin - Development Helper
echo ==========================================

set PROJECT_ROOT=e:\web production new\srdan-technical
set PLUGIN_DIR=%PROJECT_ROOT%\elke-battery

echo Project Root: %PROJECT_ROOT%
echo Plugin Directory: %PLUGIN_DIR%
echo.

REM Check if plugin directory exists
if not exist "%PLUGIN_DIR%" (
    echo ✗ Plugin directory not found: %PLUGIN_DIR%
    exit /b 1
)

echo ✓ Plugin directory found

REM Step 1: Build the plugin
echo.
echo Step 1: Building plugin...
cd /d "%PLUGIN_DIR%"

call npm run build
if errorlevel 1 (
    echo ✗ Plugin build failed
    exit /b 1
)

echo ✓ Plugin built successfully

REM Step 2: Navigate back to project root
cd /d "%PROJECT_ROOT%"

REM Step 3: Reinstall plugin
echo.
echo Step 2: Reinstalling plugin in main project...

call npm install file:./elke-battery --force
if errorlevel 1 (
    echo ✗ Plugin installation failed
    exit /b 1
)

echo ✓ Plugin installed successfully

REM Step 4: Sync with Capacitor
echo.
echo Step 3: Syncing with Capacitor...

call npx cap sync
if errorlevel 1 (
    echo ⚠ Capacitor sync completed with warnings
) else (
    echo ✓ Capacitor sync completed
)

REM Step 5: Display available commands
echo.
echo 🚀 Available development commands:
echo ================================
echo npm start                    # Start development server
echo npx cap run android         # Run on Android
echo npx cap run ios             # Run on iOS
echo npx cap build android       # Build for Android
echo npx cap build ios           # Build for iOS
echo.

echo ✓ Plugin update completed! 🎉
echo.
echo You can now test the plugin by running:
echo npm start
echo.
echo Then navigate to: http://localhost:8100/tabs/plugin

pause
