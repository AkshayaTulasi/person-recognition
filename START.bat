@echo off
REM Person Details Image Recognition Website - Start Script
echo.
echo ========================================
echo  Person Details Recognition System
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7+ from https://www.python.org
    pause
    exit /b 1
)

REM Check if in proj directory
if not exist "run.py" (
    echo ERROR: run.py not found!
    echo Please run this script from the proj/ directory
    pause
    exit /b 1
)

echo Checking dependencies...
echo.

REM Check and install requirements
python -m pip show flask >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing required packages...
    python -m pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
)

echo.
echo ========================================
echo  Starting Application...
echo ========================================
echo.
echo Access the application at:
echo   http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Run the Flask app
python run.py

pause
