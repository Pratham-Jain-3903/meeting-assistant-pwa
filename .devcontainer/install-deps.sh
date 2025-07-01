#!/bin/bash

# Install dependencies script
set -e

echo "📦 Installing project dependencies..."

# Install frontend dependencies
if [ -f "frontend/package.json" ]; then
    echo "🟦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo "✅ Frontend dependencies installed"
fi

# Install backend dependencies
if [ -f "backend/requirements.txt" ]; then
    echo "🐍 Installing backend dependencies..."
    pip install -r backend/requirements.txt
    echo "✅ Backend dependencies installed"
fi

# Install development dependencies
if [ -f ".devcontainer/requirements-dev.txt" ]; then
    echo "🛠️ Installing development dependencies..."
    pip install -r .devcontainer/requirements-dev.txt
    echo "✅ Development dependencies installed"
fi

echo "🎉 All dependencies installed successfully!"
