#!/bin/bash

# Post-create script - runs after the container is created
set -e

echo "🚀 Running post-create setup..."

# Ensure we're in the workspace directory
cd /workspace

# Set up git hooks directory
if [ -d ".git" ]; then
    echo "📝 Setting up git hooks..."
    mkdir -p .git/hooks
    
    # Create pre-commit hook for linting and formatting
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Run linting and formatting before commit

echo "Running pre-commit checks..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Not in a git repository"
    exit 0
fi

# Run Python formatting and linting
if [ -d "backend" ]; then
    echo "🐍 Formatting Python code..."
    cd backend
    black . --check --quiet || (echo "❌ Python code needs formatting. Run: black ." && exit 1)
    isort . --check-only --quiet || (echo "❌ Python imports need sorting. Run: isort ." && exit 1)
    flake8 . || (echo "❌ Python linting failed." && exit 1)
    cd ..
fi

# Run TypeScript/JavaScript linting
if [ -d "frontend" ]; then
    echo "🟦 Checking TypeScript/JavaScript code..."
    cd frontend
    if [ -f "package.json" ]; then
        npm run lint --silent || (echo "❌ Frontend linting failed." && exit 1)
        npm run type-check --silent || (echo "❌ TypeScript check failed." && exit 1)
    fi
    cd ..
fi

echo "✅ Pre-commit checks passed!"
EOF

    chmod +x .git/hooks/pre-commit
fi

# Install frontend dependencies if package.json exists
if [ -f "frontend/package.json" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Install backend dependencies
if [ -f "backend/requirements.txt" ]; then
    echo "🐍 Installing backend dependencies..."
    pip install -r backend/requirements.txt
fi

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p data/uploads
mkdir -p data/models
mkdir -p data/db
mkdir -p data/logs
mkdir -p backend/app/static
mkdir -p frontend/public/icons

# Set up environment files if they don't exist
if [ ! -f "backend/.env" ]; then
    echo "⚙️ Creating backend environment file..."
    cp backend/.env.example backend/.env 2>/dev/null || cat > backend/.env << 'EOF'
# Development environment variables
DATABASE_URL=sqlite:///./data/db/meeting_assistant.db
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
SECRET_KEY=dev-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
WHISPER_MODEL_SIZE=base
ENABLE_GPU=false
MAX_UPLOAD_SIZE=200MB
ALLOWED_AUDIO_FORMATS=wav,mp3,m4a,flac
EOF
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "⚙️ Creating frontend environment file..."
    cat > frontend/.env.local << 'EOF'
# Development environment variables
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
EOF
fi

# Download AI models in background (optional)
echo "🤖 Preparing AI models..."
python3 -c "
import warnings
warnings.filterwarnings('ignore')

try:
    import whisper
    print('📥 Downloading Whisper base model...')
    whisper.load_model('base')
    print('✅ Whisper model ready')
except Exception as e:
    print(f'⚠️ Could not download Whisper model: {e}')

try:
    from transformers import pipeline
    print('📥 Downloading BART model...')
    pipeline('summarization', model='facebook/bart-large-cnn')
    print('✅ BART model ready')
except Exception as e:
    print(f'⚠️ Could not download BART model: {e}')

try:
    from sentence_transformers import SentenceTransformer
    print('📥 Downloading sentence transformer...')
    SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    print('✅ Sentence transformer ready')
except Exception as e:
    print(f'⚠️ Could not download sentence transformer: {e}')
" &

# Create VS Code workspace settings
mkdir -p .vscode
if [ ! -f ".vscode/settings.json" ]; then
    echo "⚙️ Creating VS Code workspace settings..."
    cat > .vscode/settings.json << 'EOF'
{
  "python.defaultInterpreterPath": "/usr/local/bin/python3",
  "python.formatting.provider": "black",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": false,
  "python.linting.flake8Enabled": true,
  "python.sortImports.args": ["--profile", "black"],
  "typescript.updateImportsOnFileMove.enabled": "always",
  "javascript.updateImportsOnFileMove.enabled": "always",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "files.associations": {
    "*.mdx": "markdown",
    "*.env.*": "properties"
  }
}
EOF
fi

# Create launch configuration for debugging
if [ ! -f ".vscode/launch.json" ]; then
    echo "🐛 Creating VS Code debug configuration..."
    cat > .vscode/launch.json << 'EOF'
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "FastAPI Backend",
      "type": "python",
      "request": "launch",
      "program": "/usr/local/bin/uvicorn",
      "args": ["main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
      "cwd": "${workspaceFolder}/backend",
      "env": {
        "PYTHONPATH": "${workspaceFolder}/backend"
      },
      "console": "integratedTerminal",
      "justMyCode": false
    },
    {
      "name": "Next.js Frontend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/frontend/node_modules/.bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}/frontend",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "serverReadyAction": {
        "pattern": "ready - started server on .+, url: (https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    }
  ],
  "compounds": [
    {
      "name": "Full Stack",
      "configurations": ["FastAPI Backend", "Next.js Frontend"]
    }
  ]
}
EOF
fi

# Create tasks for VS Code
if [ ! -f ".vscode/tasks.json" ]; then
    echo "⚙️ Creating VS Code tasks..."
    cat > .vscode/tasks.json << 'EOF'
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Backend",
      "type": "shell",
      "command": "uvicorn",
      "args": ["main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
      "options": {
        "cwd": "${workspaceFolder}/backend"
      },
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      },
      "isBackground": true,
      "problemMatcher": []
    },
    {
      "label": "Start Frontend",
      "type": "shell",
      "command": "npm",
      "args": ["run", "dev"],
      "options": {
        "cwd": "${workspaceFolder}/frontend"
      },
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      },
      "isBackground": true,
      "problemMatcher": []
    },
    {
      "label": "Install Dependencies",
      "type": "shell",
      "command": ".devcontainer/install-deps.sh",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Format Code",
      "type": "shell",
      "command": ".devcontainer/format-code.sh",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Run Tests",
      "type": "shell",
      "command": ".devcontainer/run-tests.sh",
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    }
  ]
}
EOF
fi

echo "✅ Post-create setup completed!"
echo ""
echo "🎉 Your AI Meeting Assistant PWA development environment is ready!"
echo ""
echo "📖 Quick start:"
echo "  1. Open VS Code terminal"
echo "  2. Run 'npm run dev' in frontend/ for the Next.js app"
echo "  3. Run 'uvicorn main:app --reload' in backend/ for the FastAPI server"
echo "  4. Visit http://localhost:3000 for the frontend"
echo "  5. Visit http://localhost:8000/docs for the API documentation"
echo ""
echo "🔧 Available VS Code tasks:"
echo "  - Ctrl+Shift+P → 'Tasks: Run Task' → 'Start Backend'"
echo "  - Ctrl+Shift+P → 'Tasks: Run Task' → 'Start Frontend'"
echo "  - Ctrl+Shift+P → 'Tasks: Run Task' → 'Install Dependencies'"
echo ""
echo "🐛 Debug configurations available in VS Code debug panel"
echo ""
