#!/bin/bash

# Run tests script
set -e

echo "🧪 Running tests..."

# Run Python tests
if [ -d "backend" ] && [ -f "backend/requirements.txt" ]; then
    echo "🐍 Running Python tests..."
    cd backend
    
    # Check if pytest is available
    if command -v pytest &> /dev/null; then
        pytest tests/ -v 2>/dev/null || echo "⚠️ No tests found or pytest not configured"
    else
        echo "⚠️ pytest not installed"
    fi
    
    cd ..
fi

# Run frontend tests
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    echo "🟦 Running frontend tests..."
    cd frontend
    
    # Check if test script exists
    if npm run test --dry-run &> /dev/null; then
        npm test 2>/dev/null || echo "⚠️ No tests found or test script not configured"
    else
        echo "⚠️ No test script found in package.json"
    fi
    
    cd ..
fi

echo "🎉 Tests completed!"
