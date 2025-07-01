#!/bin/bash

# AI Meeting Assistant PWA Setup Script
echo "🚀 Setting up AI Meeting Assistant PWA..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9+ first."
    echo "Visit: https://python.org/"
    exit 1
fi

# Check if pip is installed
if ! command -v pip &> /dev/null; then
    echo "❌ pip is not installed. Please install pip first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
python -m venv venv

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

pip install -r requirements.txt

echo "✅ Backend dependencies installed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "✅ Frontend dependencies installed"

# Create data directories
echo "📁 Creating data directories..."
cd ../backend
mkdir -p data
mkdir -p data/knowledge_base

# Copy environment files
echo "⚙️ Setting up environment files..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created backend/.env file. Please update with your configuration."
fi

cd ../frontend
if [ ! -f .env.local ]; then
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
    echo "NEXT_PUBLIC_WS_URL=ws://localhost:8000" >> .env.local
    echo "Created frontend/.env.local file"
fi

echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Backend: cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "2. Frontend: cd frontend && npm run dev"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "🔧 Optional configuration:"
echo "- Update backend/.env with Google Calendar API credentials"
echo "- Configure OPEA integration settings"
echo ""
echo "📚 For more information, see README.md"
