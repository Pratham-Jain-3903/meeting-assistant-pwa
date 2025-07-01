# AI-Powered Meeting Assistant PWA

A full-stack Progressive Web App for real-time meeting transcription, AI-powered insights, and collaborative note-taking.

## Features

- 🎥 **Embedded Jitsi Meet** - Join meetings without external redirects
- 🎤 **Live Transcription** - Real-time speech-to-text using Whisper
- 🤖 **AI Insights** - Automatic summarization and sentiment analysis
- 📝 **Collaborative Notes** - Real-time collaborative editing with Y.js
- 💾 **Offline Storage** - Full offline capability with IndexedDB
- 📅 **Calendar Integration** - Export action items to Google Calendar
- 🔐 **Privacy-First** - All processing happens locally
- 📱 **PWA Ready** - Installable on any device

## Tech Stack

### Frontend
- Next.js 14 with App Router
- Progressive Web App (PWA) with offline support
- IndexedDB for local storage (localForage)
- Y.js for collaborative editing
- Web Audio API for microphone capture

### Backend
- FastAPI with WebSocket support
- SQLite database (SQLModel/SQLAlchemy)
- Whisper for speech recognition
- BART for summarization
- DistilBERT for sentiment analysis
- LangChain + FAISS for RAG
- Google Calendar API integration

## Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.9+ and pip
- FFmpeg (for audio processing)

### Installation

1. **Clone and setup:**
```bash
cd meeting-assistant-pwa
```

2. **Backend setup:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

3. **Frontend setup:**
```bash
cd frontend
npm install
npm run dev
```

4. **Access the app:**
- Development: http://localhost:3000
- Backend API: http://localhost:8000

### Production Build

```bash
# Frontend (PWA)
cd frontend
npm run build
npm start

# Backend
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Architecture

### Frontend Structure
```
frontend/
├── app/                    # Next.js App Router
│   ├── meeting/           # Meeting room pages
│   ├── insights/          # Insights and analytics
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── JitsiEmbed.tsx    # Jitsi Meet integration
│   ├── TranscriptPanel.tsx # Live transcript display
│   ├── SummaryPanel.tsx   # AI insights panel
│   └── NotesEditor.tsx    # Collaborative notes
├── lib/                   # Utilities and services
│   ├── storage.ts         # IndexedDB wrapper
│   ├── websocket.ts       # WebSocket client
│   └── audio.ts           # Audio capture
└── public/               # PWA assets and manifest
```

### Backend Structure
```
backend/
├── app/
│   ├── api/              # API endpoints
│   ├── models/           # Database models
│   ├── services/         # Business logic
│   └── websocket/        # WebSocket handlers
├── ai/                   # AI model services
│   ├── transcription.py  # Whisper integration
│   ├── summarization.py  # BART integration
│   └── sentiment.py      # DistilBERT integration
└── main.py              # FastAPI app
```

## API Endpoints

### REST API
- `GET /api/meetings` - Get meeting history
- `POST /api/meetings` - Create new meeting
- `GET /api/meetings/{id}/summary` - Get meeting summary
- `POST /api/calendar/export` - Export to Google Calendar

### WebSocket
- `/ws/meeting/{meeting_id}` - Real-time meeting updates
- `/ws/notes/{meeting_id}` - Collaborative notes sync

## Configuration

### Environment Variables

Create `.env` files in both `frontend/` and `backend/`:

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

**Backend (.env):**
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
DATABASE_URL=sqlite:///./meeting_assistant.db
```

## Usage

1. **Start a Meeting:**
   - Navigate to the Meeting Room
   - Join via embedded Jitsi Meet
   - Enable microphone for live transcription

2. **AI Features:**
   - View real-time transcript
   - See live sentiment analysis
   - Get AI-generated summaries
   - Access context from previous meetings

3. **Collaborative Notes:**
   - Edit notes in real-time with team members
   - Notes sync across all connected clients
   - Offline editing with sync on reconnect

4. **Export & Integration:**
   - Export action items to Google Calendar
   - Integrate with OPEA workflows
   - Download meeting summaries

## Deployment

### Local Deployment
- Frontend: Builds to static files, can be served by any web server
- Backend: Single Python process, no external dependencies

### Docker Deployment
```bash
docker-compose up -d
```

### PWA Installation
- Visit the app in a modern browser
- Click "Install" when prompted
- Use as a native app on desktop/mobile

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please use the GitHub Issues page.
