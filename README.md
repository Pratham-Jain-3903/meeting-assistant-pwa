# 🤖 AI-Powered Meeting Assistant PWA

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688)](https://fastapi.tiangolo.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-blue)](https://web.dev/progressive-web-apps/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](https://www.docker.com/)

**Transform your meetings with AI-powered transcription, insights, and seamless collaboration**

[Demo](https://your-demo-url.com) • [Documentation](https://github.com/Pratham-Jain-3903/meeting-assistant-pwa/wiki) • [Report Bug](https://github.com/Pratham-Jain-3903/meeting-assistant-pwa/issues) • [Request Feature](https://github.com/Pratham-Jain-3903/meeting-assistant-pwa/issues)

</div>

---

## ✨ Overview

A sophisticated Progressive Web App that revolutionizes meeting experiences through real-time AI transcription, intelligent insights, and collaborative features. Built with modern web technologies for seamless cross-platform deployment.

> 🚀 **Live Demo**: Experience the app at your local device, live demo coming soon (https://localhost:3000)

## 🎯 Key Features

### 🎥 **Video Conferencing**
- **Embedded Jitsi Meet** - Seamless video calls without external redirects
- **Multi-platform Support** - Works on desktop, mobile, and tablets
- **HD Video & Audio** - Crystal clear communication
- **Screen Sharing** - Present and collaborate in real-time

### 🎤 **AI-Powered Transcription**
- **Real-time Speech-to-Text** - Live transcription using OpenAI Whisper
- **Multi-language Support** - Supports 50+ languages
- **Speaker Identification** - Automatic speaker detection and labeling
- **Noise Reduction** - Advanced audio processing for clarity

### 🤖 **Intelligent Insights**
- **Smart Summarization** - AI-generated meeting summaries using BART
- **Sentiment Analysis** - Real-time mood and engagement tracking
- **Action Item Extraction** - Automatic identification of tasks and follow-ups
- **Key Topics** - Important discussion points highlighted
- **Meeting Analytics** - Participation metrics and trends

### 📝 **Collaborative Features**
- **Real-time Notes** - Collaborative editing with Y.js synchronization
- **Offline-First** - Full functionality without internet connection
- **Version History** - Track changes and revert if needed
- **Rich Text Editor** - Formatting, links, and embedded media

### 💾 **Data & Storage**
- **Local-First Architecture** - Data stored locally with IndexedDB
- **Privacy-Focused** - All AI processing happens on your infrastructure
- **Export Options** - PDF, Word, JSON, and calendar formats
- **Search & Filter** - Full-text search across all meetings

### � **Integrations**
- **Google Calendar** - Automatic event creation and updates
- **Outlook Integration** - Seamless scheduling and reminders
- **Slack/Teams** - Meeting summaries shared to channels
- **API Access** - RESTful API for custom integrations

## 🛠️ Tech Stack

<div align="center">

| **Frontend** | **Backend** | **AI/ML** | **Infrastructure** |
|:---:|:---:|:---:|:---:|
| ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) | ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white) | ![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white) | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) |
| ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) | ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) | ![Hugging Face](https://img.shields.io/badge/🤗%20Hugging%20Face-FFD21E?style=for-the-badge) | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white) |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) | ![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white) | ![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge) | ![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white) |

</div>

### 🎨 Frontend Technologies
- **Next.js 14** - React framework with App Router and Server Components
- **TypeScript** - Type-safe development with enhanced IDE support
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **PWA Support** - Service workers, offline functionality, installable
- **IndexedDB** - Client-side storage with localForage wrapper
- **Y.js** - Real-time collaborative editing framework
- **Web Audio API** - Advanced microphone capture and audio processing

### ⚡ Backend Technologies
- **FastAPI** - High-performance Python API framework with automatic docs
- **WebSocket** - Real-time bidirectional communication
- **SQLModel** - Modern Python ORM with SQLAlchemy and Pydantic
- **SQLite/PostgreSQL** - Flexible database options for development and production
- **Redis** - Caching and session management
- **Alembic** - Database migration management

### 🧠 AI & Machine Learning
- **OpenAI Whisper** - State-of-the-art speech recognition
- **Hugging Face Transformers** - Pre-trained models for NLP tasks
- **BART** - Advanced text summarization
- **DistilBERT** - Efficient sentiment analysis
- **LangChain** - AI application framework for complex workflows
- **FAISS** - Vector similarity search for RAG (Retrieval-Augmented Generation)
- **Sentence Transformers** - Semantic text embeddings

## 🚀 Quick Start

### 📋 Prerequisites

Ensure you have the following installed on your system:

- **Node.js** `18.0+` and **npm**/**yarn** ([Download](https://nodejs.org/))
- **Python** `3.9+` and **pip** ([Download](https://python.org/))
- **FFmpeg** for audio processing ([Installation Guide](https://ffmpeg.org/download.html))
- **Git** for version control ([Download](https://git-scm.com/))

### ⚡ One-Click Setup

**Option 1: Automated Setup (Recommended)**
```bash
# Clone the repository
git clone https://github.com/Pratham-Jain-3903/meeting-assistant-pwa.git
cd meeting-assistant-pwa

# Run the setup script
chmod +x setup.sh
./setup.sh
```

**Option 2: Docker Compose (Fastest)**
```bash
# Clone and start with Docker
git clone https://github.com/Pratham-Jain-3903/meeting-assistant-pwa.git
cd meeting-assistant-pwa
docker-compose up -d
```

### 🔧 Manual Installation

<details>
<summary>Click to expand manual setup instructions</summary>

#### 1. **Clone the Repository**
```bash
git clone https://github.com/Pratham-Jain-3903/meeting-assistant-pwa.git
cd meeting-assistant-pwa
```

#### 2. **Backend Setup**
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
python -c "from app.database import create_tables; create_tables()"

# Start the server
uvicorn main:app --reload --port 8000
```

#### 3. **Frontend Setup**
```bash
# Open new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install
# or
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
# or
yarn dev
```

#### 4. **Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

</details>

### Production Build

#### Frontend (PWA)
```bash
cd frontend

# Build for production
npm run build

# Test production build locally
npm start

# Deploy to static hosting (Vercel, Netlify, etc.)
npm run deploy
```

#### Backend
```bash
cd backend

# Install production dependencies
pip install -r requirements.txt --no-dev

# Run with Gunicorn (production WSGI server)
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Or with Uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4 --log-level info
```

#### Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with Docker Swarm
docker stack deploy -c docker-compose.prod.yml meeting-assistant

# Or with Kubernetes
kubectl apply -f k8s/
```

## 🚀 Deployment Options

### ☁️ Cloud Deployment

#### **Vercel (Frontend) + Railway (Backend)**
```bash
# Frontend to Vercel
npm install -g vercel
vercel --prod

# Backend to Railway
railway login
railway new
railway up
```

#### **AWS Deployment**
```bash
# Using AWS CDK
npm install -g aws-cdk
cdk deploy --all

# Using Docker on ECS
aws ecr get-login-password | docker login --username AWS --password-stdin
docker build -t meeting-assistant .
docker tag meeting-assistant:latest <account>.dkr.ecr.<region>.amazonaws.com/meeting-assistant:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/meeting-assistant:latest
```

#### **Google Cloud Platform**
```bash
# Using Cloud Run
gcloud run deploy meeting-assistant --source . --platform managed --region us-central1

# Using GKE
gcloud container clusters create meeting-assistant-cluster
kubectl apply -f k8s/
```

#### **Azure Deployment**
```bash
# Using Azure Container Instances
az container create --resource-group myResourceGroup --name meeting-assistant --image your-registry/meeting-assistant:latest

# Using Azure App Service
az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name meeting-assistant --deployment-container-image-name your-registry/meeting-assistant:latest
```

### 🏠 Self-Hosted Deployment

#### **VPS/Dedicated Server**
```bash
# Using Docker Compose
git clone https://github.com/Pratham-Jain-3903/meeting-assistant-pwa.git
cd meeting-assistant-pwa
cp .env.example .env
# Edit .env with your configuration
docker-compose up -d

# Using systemd service
sudo cp scripts/meeting-assistant.service /etc/systemd/system/
sudo systemctl enable meeting-assistant
sudo systemctl start meeting-assistant
```

#### **Kubernetes**
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

### 📱 PWA Installation

#### Browser Installation
1. Visit your deployed app URL
2. Look for the "Install" prompt in the address bar
3. Click "Install" to add to home screen/applications
4. App will behave like a native application

#### Manual Installation
1. Open browser menu (Chrome: ⋮, Firefox: ☰, Safari: Share)
2. Select "Install [App Name]" or "Add to Home Screen"
3. Follow the prompts to complete installation

#### Features After Installation
- **Offline Access**: Continue using core features without internet
- **Push Notifications**: Receive meeting reminders and updates
- **Native Feel**: Seamless integration with OS
- **Auto-Updates**: Automatic updates when online

## 🏗️ Architecture Overview

### 📐 System Architecture

```mermaid
graph TB
    subgraph "Frontend (Next.js PWA)"
        A[React Components] --> B[Service Worker]
        A --> C[IndexedDB Storage]
        A --> D[WebSocket Client]
        A --> E[Audio Capture]
    end
    
    subgraph "Backend (FastAPI)"
        F[REST API] --> G[WebSocket Server]
        F --> H[Database Layer]
        F --> I[AI Services]
        G --> J[Real-time Sync]
    end
    
    subgraph "AI/ML Pipeline"
        K[Whisper STT] --> L[Text Processing]
        L --> M[BART Summarization]
        L --> N[Sentiment Analysis]
        L --> O[Vector Store]
    end
    
    subgraph "External Services"
        P[Jitsi Meet]
        Q[Google Calendar]
        R[File Storage]
    end
    
    A --> F
    D --> G
    I --> K
    F --> P
    F --> Q
    H --> R
```

### 🗂️ Project Structure

```
meeting-assistant-pwa/
├── 📁 frontend/                    # Next.js PWA Application
│   ├── 📁 app/                    # App Router Pages
│   │   ├── 📁 meeting/           # Meeting Room Interface
│   │   │   ├── 📁 [id]/         # Dynamic Meeting Pages
│   │   │   └── 📁 join/         # Meeting Join Flow
│   │   ├── 📁 insights/          # Analytics Dashboard
│   │   ├── layout.tsx            # Root Layout Component
│   │   ├── page.tsx             # Home Page
│   │   └── globals.css          # Global Styles
│   ├── 📁 components/            # Reusable React Components
│   │   ├── JitsiEmbed.tsx       # Video Conference Integration
│   │   ├── TranscriptPanel.tsx  # Live Transcript Display
│   │   ├── SummaryPanel.tsx     # AI Insights Panel
│   │   ├── NotesEditor.tsx      # Collaborative Editor
│   │   └── AudioVisualizer.tsx  # Real-time Audio Visualization
│   ├── 📁 lib/                   # Utility Libraries
│   │   ├── api.ts               # API Client Functions
│   │   ├── storage.ts           # IndexedDB Wrapper
│   │   ├── websocket.ts         # WebSocket Management
│   │   ├── audio.ts             # Audio Processing
│   │   └── utils.ts             # Helper Functions
│   ├── 📁 public/               # Static Assets
│   │   ├── 📁 icons/           # PWA Icons
│   │   ├── manifest.json        # PWA Manifest
│   │   └── sw.js               # Service Worker
│   └── 📄 Configuration Files
├── 📁 backend/                   # FastAPI Backend
│   ├── 📁 app/                  # Application Core
│   │   ├── 📁 api/             # REST API Endpoints
│   │   │   ├── auth.py         # Authentication Routes
│   │   │   ├── meetings.py     # Meeting Management
│   │   │   └── calendar.py     # Calendar Integration
│   │   ├── 📁 models/          # Database Models
│   │   │   ├── meeting.py      # Meeting Entity
│   │   │   ├── user.py         # User Entity
│   │   │   └── transcript.py   # Transcript Entity
│   │   ├── 📁 services/        # Business Logic
│   │   │   ├── ai_service.py   # AI Processing Pipeline
│   │   │   ├── transcription_service.py # Speech-to-Text
│   │   │   └── calendar_service.py # Calendar Operations
│   │   ├── 📁 websocket/       # Real-time Communication
│   │   │   └── connection_manager.py # WebSocket Handler
│   │   └── database.py         # Database Configuration
│   ├── 📁 data/                # Data Storage
│   │   └── 📁 knowledge_base/  # Vector Store Data
│   ├── main.py                 # FastAPI Application Entry
│   └── requirements.txt        # Python Dependencies
├── 📁 shared/                   # Shared TypeScript Types
├── 📄 docker-compose.yml       # Docker Configuration
├── 📄 setup.sh                 # Automated Setup Script
└── 📄 README.md                # Project Documentation
```

### 🔄 Data Flow

1. **Meeting Creation**: User creates meeting → Backend generates room → Frontend navigates to meeting
2. **Audio Capture**: Browser captures microphone → Web Audio API processes → Sends to backend
3. **AI Processing**: Whisper transcribes → BART summarizes → DistilBERT analyzes sentiment
4. **Real-time Sync**: WebSocket broadcasts updates → All clients receive live updates
5. **Offline Support**: IndexedDB stores data → Service worker handles offline requests
6. **Export/Integration**: User requests export → Backend formats data → External APIs updated

## 🔌 API Reference

### 🌐 REST API Endpoints

#### Meeting Management
```http
# Get all meetings
GET /api/meetings
Authorization: Bearer <token>

# Create new meeting
POST /api/meetings
Content-Type: application/json
{
  "title": "Team Standup",
  "description": "Daily team sync",
  "scheduled_time": "2025-07-01T10:00:00Z"
}

# Get specific meeting
GET /api/meetings/{meeting_id}

# Update meeting
PUT /api/meetings/{meeting_id}

# Delete meeting
DELETE /api/meetings/{meeting_id}

# Get meeting summary
GET /api/meetings/{meeting_id}/summary

# Get meeting transcript
GET /api/meetings/{meeting_id}/transcript

# Get meeting analytics
GET /api/meetings/{meeting_id}/analytics
```

#### AI Services
```http
# Process audio for transcription
POST /api/transcribe
Content-Type: multipart/form-data
{
  "audio": <audio_file>,
  "language": "en",
  "meeting_id": "uuid"
}

# Generate meeting summary
POST /api/summarize
Content-Type: application/json
{
  "text": "meeting transcript...",
  "summary_type": "brief|detailed|action_items"
}

# Analyze sentiment
POST /api/analyze/sentiment
Content-Type: application/json
{
  "text": "meeting transcript..."
}

# Extract action items
POST /api/extract/actions
Content-Type: application/json
{
  "text": "meeting transcript..."
}
```

#### Calendar Integration
```http
# Export to Google Calendar
POST /api/calendar/export
Content-Type: application/json
{
  "meeting_id": "uuid",
  "calendar_type": "google|outlook",
  "include_summary": true,
  "include_action_items": true
}

# Get calendar events
GET /api/calendar/events
Query params: start_date, end_date, calendar_type

# Create calendar event
POST /api/calendar/events
Content-Type: application/json
{
  "title": "Meeting Title",
  "start_time": "2025-07-01T10:00:00Z",
  "end_time": "2025-07-01T11:00:00Z",
  "attendees": ["email1@example.com", "email2@example.com"]
}
```

### 🔄 WebSocket Events

#### Connection
```javascript
// Connect to meeting room
const ws = new WebSocket('ws://localhost:8000/ws/meeting/{meeting_id}');

// Connect to notes collaboration
const notesWs = new WebSocket('ws://localhost:8000/ws/notes/{meeting_id}');
```

#### Meeting Events
```javascript
// Real-time transcript updates
{
  "type": "transcript_update",
  "data": {
    "speaker": "John Doe",
    "text": "Let's discuss the quarterly results",
    "timestamp": "2025-07-01T10:15:30Z",
    "confidence": 0.95
  }
}

// Participant joined/left
{
  "type": "participant_update",
  "data": {
    "action": "joined|left",
    "participant": {
      "id": "user_123",
      "name": "Jane Smith",
      "avatar": "https://avatar.url"
    }
  }
}

// AI insights update
{
  "type": "insights_update",
  "data": {
    "summary": "Meeting summary...",
    "sentiment": "positive",
    "action_items": ["Task 1", "Task 2"],
    "key_topics": ["Q4 Results", "Budget Planning"]
  }
}
```

#### Notes Collaboration
```javascript
// Real-time note updates (Y.js format)
{
  "type": "notes_update",
  "data": {
    "operation": "insert|delete|format",
    "position": 42,
    "content": "New text content",
    "user": "user_123"
  }
}

// Cursor position updates
{
  "type": "cursor_update",
  "data": {
    "user": "user_123",
    "position": 42,
    "selection": [42, 50]
  }
}
```

### 📊 Response Formats

#### Standard Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully",
  "timestamp": "2025-07-01T10:00:00Z"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "field": "title",
      "issue": "Title is required"
    }
  },
  "timestamp": "2025-07-01T10:00:00Z"
}
```

### 🔐 Authentication

#### Bearer Token Authentication
```http
Authorization: Bearer <jwt_token>
```

#### API Key Authentication
```http
X-API-Key: <your_api_key>
```

#### OAuth 2.0 (Google Calendar Integration)
```http
Authorization: Bearer <oauth_access_token>
```

## ⚙️ Configuration

### 🔧 Environment Variables

#### Frontend Configuration (`.env.local`)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Jitsi Meet Configuration
NEXT_PUBLIC_JITSI_DOMAIN=meet.jit.si
NEXT_PUBLIC_JITSI_ROOM_PREFIX=meeting-assistant

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_CALENDAR_INTEGRATION=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# PWA Configuration
NEXT_PUBLIC_APP_NAME="AI Meeting Assistant"
NEXT_PUBLIC_APP_SHORT_NAME="MeetingAI"
NEXT_PUBLIC_APP_DESCRIPTION="AI-Powered Meeting Assistant"

# Analytics (Optional)
NEXT_PUBLIC_GA_TRACKING_ID=GA_MEASUREMENT_ID
NEXT_PUBLIC_HOTJAR_ID=HOTJAR_SITE_ID
```

#### Backend Configuration (`.env`)
```bash
# Database Configuration
DATABASE_URL=sqlite:///./meeting_assistant.db
# DATABASE_URL=postgresql://user:password@localhost:5432/meeting_assistant

# Redis Configuration (Optional - for caching)
REDIS_URL=redis://localhost:6379/0

# AI Service Configuration
OPENAI_API_KEY=your_openai_api_key
HUGGINGFACE_API_KEY=your_huggingface_token

# Google Services
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# Microsoft Services (Optional)
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret

# JWT Configuration
JWT_SECRET_KEY=your_super_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30

# CORS Configuration
ALLOWED_ORIGINS=["http://localhost:3000", "https://your-domain.com"]

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=50

# Audio Processing
AUDIO_SAMPLE_RATE=16000
AUDIO_CHANNELS=1
WHISPER_MODEL=base  # tiny, base, small, medium, large

# Feature Toggles
ENABLE_REAL_TIME_TRANSCRIPTION=true
ENABLE_SENTIMENT_ANALYSIS=true
ENABLE_SUMMARIZATION=true
ENABLE_ACTION_ITEM_EXTRACTION=true

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# Performance
WORKER_PROCESSES=1
MAX_CONNECTIONS=100
TIMEOUT_SECONDS=300
```

### 🔒 Security Configuration

#### API Security
```bash
# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_BURST=10

# CORS Settings
CORS_ALLOW_CREDENTIALS=true
CORS_ALLOW_METHODS=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
CORS_ALLOW_HEADERS=["*"]

# SSL/TLS (Production)
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
FORCE_HTTPS=true
```

#### Data Privacy
```bash
# Data Retention
TRANSCRIPT_RETENTION_DAYS=90
MEETING_RETENTION_DAYS=365
ANALYTICS_RETENTION_DAYS=730

# Privacy Settings
ANONYMIZE_TRANSCRIPTS=false
ENABLE_DATA_ENCRYPTION=true
GDPR_COMPLIANCE=true
```

### 🐳 Docker Configuration

#### Development
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///./data/meeting_assistant.db
    volumes:
      - ./backend/data:/app/data

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

#### Production
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  frontend:
    image: your-registry/meeting-assistant-frontend:latest
    environment:
      - NEXT_PUBLIC_API_URL=https://api.your-domain.com
    deploy:
      replicas: 2

  backend:
    image: your-registry/meeting-assistant-backend:latest
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/meeting_assistant
    deploy:
      replicas: 3

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=meeting_assistant
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
```

### 🎛️ Advanced Configuration

#### AI Model Configuration
```bash
# Whisper Model Settings
WHISPER_MODEL_SIZE=base  # tiny, base, small, medium, large
WHISPER_DEVICE=cpu       # cpu, cuda
WHISPER_COMPUTE_TYPE=int8  # int8, int16, float16, float32

# Summarization Settings
SUMMARIZATION_MODEL=facebook/bart-large-cnn
MAX_SUMMARY_LENGTH=150
MIN_SUMMARY_LENGTH=50

# Sentiment Analysis
SENTIMENT_MODEL=distilbert-base-uncased-finetuned-sst-2-english
SENTIMENT_THRESHOLD=0.7

# Vector Store Settings
VECTOR_DIMENSION=384
VECTOR_INDEX_TYPE=IVF_FLAT
VECTOR_SEARCH_K=10
```

#### Performance Tuning
```bash
# Database Connection Pool
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=30
DB_POOL_TIMEOUT=30

# WebSocket Settings
WS_MAX_CONNECTIONS=1000
WS_PING_INTERVAL=20
WS_PING_TIMEOUT=10

# Caching
CACHE_TTL_SECONDS=3600
CACHE_MAX_SIZE_MB=512

# Background Tasks
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
CELERY_WORKERS=4
```

## 📱 Usage Guide

### 🎬 Starting Your First Meeting

1. **Create a New Meeting**
   - Click "Start New Meeting" on the dashboard
   - Enter meeting title and optional description
   - Choose privacy settings (public/private)

2. **Join the Conference**
   - Enable microphone and camera permissions
   - Join via embedded Jitsi Meet interface
   - No external redirects or downloads required

3. **Enable AI Features**
   - Toggle live transcription in the sidebar
   - View real-time sentiment analysis
   - Access AI-generated insights panel

### 🤖 AI-Powered Features

#### Real-time Transcription
- **Automatic Speech Recognition**: Converts speech to text in real-time
- **Speaker Identification**: Distinguishes between different speakers
- **Multi-language Support**: Detects and transcribes 50+ languages
- **Custom Vocabulary**: Add domain-specific terms for better accuracy

#### Intelligent Insights
- **Live Summarization**: Key points updated throughout the meeting
- **Action Items**: Automatically extracted tasks and assignments
- **Sentiment Tracking**: Monitor meeting mood and engagement levels
- **Topic Analysis**: Identify main discussion themes

#### Smart Search
- **Full-text Search**: Find any word or phrase across all meetings
- **Semantic Search**: AI-powered context-aware search
- **Filter Options**: By date, participants, topics, or sentiment
- **Export Results**: Save search results in multiple formats

### 📝 Collaborative Note-Taking

#### Real-time Editing
- **Simultaneous Editing**: Multiple users can edit notes simultaneously
- **Conflict Resolution**: Automatic merge of conflicting changes
- **Cursor Tracking**: See where other users are editing
- **Offline Support**: Continue editing when disconnected

#### Rich Formatting
- **Markdown Support**: Headers, lists, links, and code blocks
- **Media Embedding**: Images, videos, and documents
- **Templates**: Pre-built note structures for different meeting types
- **Version History**: Track all changes with timestamps

### 📊 Analytics & Insights

#### Meeting Analytics
- **Participation Metrics**: Speaking time, engagement levels
- **Trend Analysis**: Meeting frequency and duration patterns
- **Performance Insights**: Identify most productive meeting times
- **ROI Tracking**: Measure meeting effectiveness

#### Team Insights
- **Collaboration Patterns**: How teams work together
- **Communication Styles**: Speaking patterns and preferences
- **Knowledge Sharing**: Topics and expertise distribution
- **Productivity Metrics**: Action item completion rates

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help make the AI Meeting Assistant even better.

### 🌟 Ways to Contribute

- 🐛 **Bug Reports**: Found a bug? [Open an issue](https://github.com/Pratham-Jain-3903/meeting-assistant-pwa/issues)
- ✨ **Feature Requests**: Have an idea? [Request a feature](https://github.com/Pratham-Jain-3903/meeting-assistant-pwa/issues)
- 🔧 **Code Contributions**: Submit pull requests for bug fixes or new features
- 📚 **Documentation**: Help improve our docs and guides
- 🌍 **Translations**: Add support for new languages
- 🧪 **Testing**: Help us test new features and report issues

### 📝 Development Workflow

#### 1. **Fork & Clone**
```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/meeting-assistant-pwa.git
cd meeting-assistant-pwa

# Add upstream remote
git remote add upstream https://github.com/Pratham-Jain-3903/meeting-assistant-pwa.git
```

#### 2. **Setup Development Environment**
```bash
# Follow the Quick Start guide
./setup.sh

# Or setup manually
cd backend && pip install -r requirements.txt
cd frontend && npm install
```

#### 3. **Create Feature Branch**
```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

#### 4. **Make Changes**
- Write clean, well-documented code
- Follow existing code style and conventions
- Add tests for new functionality
- Update documentation as needed

#### 5. **Test Your Changes**
```bash
# Run backend tests
cd backend
python -m pytest

# Run frontend tests
cd frontend
npm test

# Run linting
npm run lint
```

#### 6. **Commit & Push**
```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "feat: add real-time sentiment analysis"

# Push to your fork
git push origin feature/your-feature-name
```

#### 7. **Create Pull Request**
- Go to GitHub and create a pull request
- Provide a clear title and description
- Link any related issues
- Wait for review and address feedback

### 📋 Contribution Guidelines

#### **Code Style**

**Frontend (TypeScript/React)**
```typescript
// Use TypeScript for type safety
interface MeetingProps {
  id: string
  title: string
  participants: Participant[]
}

// Use functional components with hooks
const MeetingRoom: React.FC<MeetingProps> = ({ id, title, participants }) => {
  const [isTranscribing, setIsTranscribing] = useState(false)
  
  return (
    <div className="meeting-room">
      <h1>{title}</h1>
      {/* Component JSX */}
    </div>
  )
}
```

**Backend (Python/FastAPI)**
```python
# Use type hints and docstrings
from typing import List, Optional
from pydantic import BaseModel

class MeetingCreate(BaseModel):
    """Model for creating a new meeting."""
    title: str
    description: Optional[str] = None
    participants: List[str] = []

@app.post("/api/meetings", response_model=MeetingResponse)
async def create_meeting(meeting: MeetingCreate) -> MeetingResponse:
    """Create a new meeting with the given parameters."""
    # Implementation here
    pass
```

#### **Commit Message Format**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(ai): add sentiment analysis to transcription
fix(websocket): resolve connection timeout issues
docs(readme): update installation instructions
```

#### **Pull Request Guidelines**

1. **Title**: Clear and descriptive
2. **Description**: Explain what and why
3. **Testing**: Include test cases or testing steps
4. **Documentation**: Update relevant docs
5. **Breaking Changes**: Clearly mark any breaking changes

#### **Issue Guidelines**

**Bug Reports** should include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, etc.)
- Screenshots/logs if applicable

**Feature Requests** should include:
- Clear description of the feature
- Use case and motivation
- Proposed implementation (if any)
- Mockups or examples (if applicable)

### 🏆 Recognition

Contributors will be:
- Listed in our [Contributors](https://github.com/Pratham-Jain-3903/meeting-assistant-pwa/graphs/contributors) page
- Mentioned in release notes for significant contributions
- Invited to join our contributors team (for regular contributors)

### 📞 Getting Help

Need help contributing? Reach out:

- 💬 **GitHub Discussions**: [Start a discussion](https://github.com/Pratham-Jain-3903/meeting-assistant-pwa/discussions)
- 🐛 **Issues**: [Browse existing issues](https://github.com/Pratham-Jain-3903/meeting-assistant-pwa/issues)
- 📧 **Email**: pratham.jain.3903@gmail.com
- 🔗 **LinkedIn**: [Connect with the maintainer](https://linkedin.com/in/pratham-jain-3903)

### 📜 Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing. We are committed to providing a welcoming and inclusive environment for all contributors.

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### What this means:
- ✅ **Commercial use** - Use in commercial projects
- ✅ **Modification** - Modify the source code
- ✅ **Distribution** - Distribute original or modified code
- ✅ **Private use** - Use privately without restrictions
- ❗ **License and copyright notice** - Include original license
- ❌ **Liability** - No warranty or liability provided
- ❌ **Trademark use** - Cannot use project trademarks

## 🙏 Acknowledgments

### Open Source Libraries
- [Next.js](https://nextjs.org/) - React framework for production
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [OpenAI Whisper](https://openai.com/research/whisper) - Speech recognition
- [Hugging Face Transformers](https://huggingface.co/transformers/) - NLP models
- [Jitsi Meet](https://jitsi.org/) - Video conferencing platform
- [Y.js](https://github.com/yjs/yjs) - Real-time collaboration framework

### Contributors
A big thank you to all the [contributors](https://github.com/Pratham-Jain-3903/meeting-assistant-pwa/graphs/contributors) who have helped make this project better!

### Inspiration
This project was inspired by the need for better meeting experiences and the potential of AI to enhance human collaboration.

## 📞 Support & Community

### 🆘 Getting Help

**Documentation & Guides**
- 📖 [Wiki](https://github.com/Pratham-Jain-3903/meeting-assistant-pwa/wiki) - Comprehensive guides
- 🎥 [Video Tutorials](https://youtube.com/playlist?list=your-playlist) - Step-by-step walkthroughs
- 📚 [API Documentation](https://your-api-docs.com) - Complete API reference

**Community Support**
- 💬 [GitHub Discussions](https://github.com/Pratham-Jain-3903/meeting-assistant-pwa/discussions) - Ask questions and share ideas
- 🐛 [Issue Tracker](https://github.com/Pratham-Jain-3903/meeting-assistant-pwa/issues) - Report bugs and request features
- 💼 [LinkedIn](https://linkedin.com/in/pratham-jain-3903) - Connect with the maintainer

**Enterprise Support**
For enterprise deployments and custom integrations:
- 📧 Email: pratham.jain.3903@gmail.com
- 🌐 Website: [your-website.com](https://your-website.com)
- 📅 Schedule a call: [your-calendar-link](https://calendly.com/your-link)

### 🌟 Show Your Support

If this project helps you, please consider:
- ⭐ **Star** the repository on GitHub
- 🍴 **Fork** and contribute to the project
- 📢 **Share** with your network
- 🐛 **Report** bugs you encounter
- 💡 **Suggest** new features

---

<div align="center">

**Made with ❤️ by [Pratham Jain](https://github.com/Pratham-Jain-3903) and the [community](https://github.com/Pratham-Jain-3903/meeting-assistant-pwa/graphs/contributors)**

[⬆ Back to Top](#-ai-powered-meeting-assistant-pwa)

</div>
