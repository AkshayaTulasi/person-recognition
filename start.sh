#!/bin/bash

# Person Details Image Recognition Website - Start Script

echo ""
echo "========================================"
echo " Person Details Recognition System"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.7+ first"
    exit 1
fi

# Check if in proj directory
if [ ! -f "run.py" ]; then
    echo "ERROR: run.py not found!"
    echo "Please run this script from the proj/ directory"
    exit 1
fi

echo "Checking dependencies..."
echo ""

# Check and install requirements
if ! python3 -m pip show flask &> /dev/null; then
    echo "Installing required packages..."
    python3 -m pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies"
        exit 1
    fi
    echo "Dependencies installed successfully!"
fi

echo ""
echo "========================================"
echo " Starting Application..."
echo "========================================"
echo ""
echo "Access the application at:"
echo "  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Run the Flask app
python3 run.py
