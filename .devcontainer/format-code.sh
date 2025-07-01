#!/bin/bash

# Format code script
set -e

echo "🎨 Formatting code..."

# Format Python code
if [ -d "backend" ]; then
    echo "🐍 Formatting Python code..."
    cd backend
    black .
    isort .
    cd ..
    echo "✅ Python code formatted"
fi

# Format TypeScript/JavaScript code
if [ -d "frontend" ]; then
    echo "🟦 Formatting frontend code..."
    cd frontend
    if [ -f "package.json" ]; then
        npm run format 2>/dev/null || echo "⚠️ No format script found in package.json"
    fi
    cd ..
    echo "✅ Frontend code formatted"
fi

echo "🎉 Code formatting completed!"
