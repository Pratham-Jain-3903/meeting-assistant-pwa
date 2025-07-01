from sqlmodel import SQLModel, Field
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

# Database Models
class Meeting(SQLModel, table=True):
    id: Optional[str] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    transcript: Optional[str] = None
    summary: Optional[str] = None
    participants: Optional[str] = None  # JSON string
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Summary(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    meeting_id: str = Field(foreign_key="meeting.id")
    content: str
    summary_type: str  # "full", "action_items", "key_points"
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Note(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    meeting_id: str = Field(foreign_key="meeting.id")
    content: str
    author: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Transcript(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    meeting_id: str = Field(foreign_key="meeting.id")
    speaker: Optional[str] = None
    text: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    confidence: Optional[float] = None

class CalendarEvent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    meeting_id: str = Field(foreign_key="meeting.id")
    google_event_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Request/Response Models
class MeetingCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    participants: Optional[List[str]] = None

class MeetingResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    transcript: Optional[str] = None
    summary: Optional[str] = None
    participants: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime

class TranscriptChunk(BaseModel):
    text: str
    speaker: Optional[str] = None
    timestamp: datetime
    confidence: Optional[float] = None

class SummaryResponse(BaseModel):
    content: str
    summary_type: str
    timestamp: datetime

class SentimentResponse(BaseModel):
    label: str
    score: float
    timestamp: datetime

class CalendarEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    action_items: Optional[List[str]] = None
