@echo off
REM AI Meeting Assistant PWA Setup Script for Windows
echo 🚀 Setting up AI Meeting Assistant PWA...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python 3 is not installed. Please install Python 3.9+ first.
    echo Visit: https://python.org/
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt

echo ✅ Backend dependencies installed

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd ..\frontend
npm install

echo ✅ Frontend dependencies installed

REM Create data directories
echo 📁 Creating data directories...
cd ..\backend
if not exist data mkdir data
if not exist data\knowledge_base mkdir data\knowledge_base

REM Copy environment files
echo ⚙️ Setting up environment files...
if not exist .env (
    copy .env.example .env
    echo Created backend/.env file. Please update with your configuration.
)

cd ..\frontend
if not exist .env.local (
    echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local
    echo NEXT_PUBLIC_WS_URL=ws://localhost:8000 >> .env.local
    echo Created frontend/.env.local file
)

echo 🎉 Setup complete!
echo.
echo 📋 Next steps:
echo 1. Backend: cd backend ^&^& venv\Scripts\activate ^&^& uvicorn main:app --reload
echo 2. Frontend: cd frontend ^&^& npm run dev
echo 3. Open http://localhost:3000 in your browser
echo.
echo 🔧 Optional configuration:
echo - Update backend/.env with Google Calendar API credentials
echo - Configure OPEA integration settings
echo.
echo 📚 For more information, see README.md

pause
