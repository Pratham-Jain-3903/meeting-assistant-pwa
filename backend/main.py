from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlmodel import Session, select
import asyncio
import json
import logging
from datetime import datetime
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

from app.database import create_db_and_tables, get_session
from app.models import Meeting, MeetingCreate, MeetingResponse, Summary, Note
from app.websocket.connection_manager import ConnectionManager
from app.services.transcription_service import TranscriptionService
from app.services.ai_service import AIService
from app.services.calendar_service import CalendarService
from app.api import meetings, calendar, auth

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AI Meeting Assistant API",
    description="Real-time meeting transcription and AI insights",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(meetings.router, prefix="/api", tags=["meetings"])
app.include_router(calendar.router, prefix="/api", tags=["calendar"])
app.include_router(auth.router, prefix="/api", tags=["auth"])

# Initialize services
connection_manager = ConnectionManager()
transcription_service = TranscriptionService()
ai_service = AIService()
calendar_service = CalendarService()

@app.on_event("startup")
async def startup_event():
    """Initialize database and services on startup."""
    create_db_and_tables()
    await transcription_service.initialize()
    await ai_service.initialize()
    logger.info("Application startup complete")

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "AI Meeting Assistant API", "status": "running"}

@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "services": {
            "transcription": transcription_service.is_ready(),
            "ai": ai_service.is_ready(),
            "database": True
        }
    }

@app.websocket("/ws/meeting/{meeting_id}")
async def websocket_meeting(websocket: WebSocket, meeting_id: str):
    """WebSocket endpoint for real-time meeting updates."""
    await connection_manager.connect(websocket, meeting_id)
    
    try:
        while True:
            # Receive audio data from client
            data = await websocket.receive_bytes()
            
            # Process audio for transcription
            transcript_chunk = await transcription_service.process_audio_chunk(data)
            
            if transcript_chunk:
                # Broadcast transcript to all connected clients
                await connection_manager.broadcast_to_meeting(
                    meeting_id,
                    {
                        "type": "transcript",
                        "data": transcript_chunk,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                )
                
                # Trigger AI processing
                asyncio.create_task(process_ai_insights(meeting_id, transcript_chunk))
                
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket, meeting_id)
        logger.info(f"Client disconnected from meeting {meeting_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await connection_manager.send_error(websocket, str(e))

@app.websocket("/ws/notes/{meeting_id}")
async def websocket_notes(websocket: WebSocket, meeting_id: str):
    """WebSocket endpoint for collaborative notes editing."""
    await connection_manager.connect_notes(websocket, meeting_id)
    
    try:
        while True:
            # Receive note updates from client
            data = await websocket.receive_text()
            note_update = json.loads(data)
            
            # Broadcast to other clients
            await connection_manager.broadcast_notes_to_meeting(
                meeting_id,
                note_update,
                exclude=websocket
            )
            
            # Save to database periodically
            if note_update.get("type") == "save":
                await save_meeting_notes(meeting_id, note_update.get("content", ""))
                
    except WebSocketDisconnect:
        connection_manager.disconnect_notes(websocket, meeting_id)
        logger.info(f"Notes client disconnected from meeting {meeting_id}")
    except Exception as e:
        logger.error(f"Notes WebSocket error: {e}")

async def process_ai_insights(meeting_id: str, transcript_chunk: Dict[str, Any]):
    """Process AI insights for transcript chunk."""
    try:
        # Get full transcript for context
        full_transcript = await get_meeting_transcript(meeting_id)
        
        # Generate summary if enough content
        if len(full_transcript.split()) > 50:  # Minimum words for summary
            summary = await ai_service.generate_summary(full_transcript)
            
            await connection_manager.broadcast_to_meeting(
                meeting_id,
                {
                    "type": "summary",
                    "data": summary,
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
        
        # Sentiment analysis
        sentiment = await ai_service.analyze_sentiment(transcript_chunk.get("text", ""))
        
        await connection_manager.broadcast_to_meeting(
            meeting_id,
            {
                "type": "sentiment",
                "data": sentiment,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        
        # RAG-enhanced insights
        rag_insights = await ai_service.get_rag_insights(full_transcript)
        
        if rag_insights:
            await connection_manager.broadcast_to_meeting(
                meeting_id,
                {
                    "type": "rag_insights",
                    "data": rag_insights,
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
            
    except Exception as e:
        logger.error(f"Error processing AI insights: {e}")

async def get_meeting_transcript(meeting_id: str) -> str:
    """Get full transcript for a meeting."""
    # This would typically query the database
    # For now, we'll maintain in-memory transcript
    return connection_manager.get_meeting_transcript(meeting_id)

async def save_meeting_notes(meeting_id: str, content: str):
    """Save meeting notes to database."""
    try:
        with get_session() as session:
            # Check if notes exist
            existing_note = session.exec(
                select(Note).where(Note.meeting_id == meeting_id)
            ).first()
            
            if existing_note:
                existing_note.content = content
                existing_note.updated_at = datetime.utcnow()
            else:
                note = Note(
                    meeting_id=meeting_id,
                    content=content,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                session.add(note)
            
            session.commit()
            logger.info(f"Saved notes for meeting {meeting_id}")
            
    except Exception as e:
        logger.error(f"Error saving meeting notes: {e}")

@app.post("/api/meetings/{meeting_id}/upload-audio")
async def upload_audio(
    meeting_id: str,
    audio_file: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    """Upload and process audio file for transcription."""
    try:
        # Save uploaded file temporarily
        temp_path = f"/tmp/{audio_file.filename}"
        with open(temp_path, "wb") as f:
            content = await audio_file.read()
            f.write(content)
        
        # Process with Whisper
        transcript = await transcription_service.transcribe_file(temp_path)
        
        # Clean up temp file
        os.remove(temp_path)
        
        # Save transcript to database
        meeting = session.get(Meeting, meeting_id)
        if meeting:
            meeting.transcript = transcript
            meeting.updated_at = datetime.utcnow()
            session.commit()
        
        # Trigger AI processing
        asyncio.create_task(process_ai_insights(meeting_id, {"text": transcript}))
        
        return {"transcript": transcript, "message": "Audio processed successfully"}
        
    except Exception as e:
        logger.error(f"Error processing uploaded audio: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
