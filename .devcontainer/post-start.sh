#!/bin/bash

# Post-start script - runs after the container starts
set -e

echo "🔄 Running post-start setup..."

# Ensure we're in the workspace directory
cd /workspace

# Start backend development server in background (if not already running)
if [ -f "backend/main.py" ] && ! pgrep -f "uvicorn" > /dev/null; then
    echo "🚀 Starting backend development server..."
    cd backend
    nohup uvicorn main:app --host 0.0.0.0 --port 8000 --reload > /tmp/backend.log 2>&1 &
    cd ..
fi

# Start frontend development server in background (if not already running)
if [ -f "frontend/package.json" ] && ! pgrep -f "next dev" > /dev/null; then
    echo "🌐 Starting frontend development server..."
    cd frontend
    if [ -f "package.json" ]; then
        nohup npm run dev > /tmp/frontend.log 2>&1 &
    fi
    cd ..
fi

echo "✅ Post-start setup completed!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
