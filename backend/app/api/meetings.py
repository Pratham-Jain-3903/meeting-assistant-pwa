from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
import uuid
from datetime import datetime
import json

from app.database import get_session
from app.models import Meeting, MeetingCreate, MeetingResponse, Summary, Note, Transcript

router = APIRouter()

@router.post("/meetings", response_model=MeetingResponse)
async def create_meeting(
    meeting: MeetingCreate,
    session: Session = Depends(get_session)
):
    """Create a new meeting."""
    try:
        # Generate unique meeting ID
        meeting_id = str(uuid.uuid4())
        
        # Create meeting record
        db_meeting = Meeting(
            id=meeting_id,
            title=meeting.title,
            description=meeting.description,
            start_time=meeting.start_time,
            participants=json.dumps(meeting.participants or []),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        session.add(db_meeting)
        session.commit()
        session.refresh(db_meeting)
        
        # Convert back to response model
        return MeetingResponse(
            id=db_meeting.id,
            title=db_meeting.title,
            description=db_meeting.description,
            start_time=db_meeting.start_time,
            end_time=db_meeting.end_time,
            transcript=db_meeting.transcript,
            summary=db_meeting.summary,
            participants=json.loads(db_meeting.participants or "[]"),
            created_at=db_meeting.created_at,
            updated_at=db_meeting.updated_at
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating meeting: {str(e)}"
        )

@router.get("/meetings", response_model=List[MeetingResponse])
async def get_meetings(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session)
):
    """Get list of meetings."""
    try:
        statement = select(Meeting).offset(skip).limit(limit).order_by(Meeting.created_at.desc())
        meetings = session.exec(statement).all()
        
        # Convert to response models
        response_meetings = []
        for meeting in meetings:
            response_meetings.append(MeetingResponse(
                id=meeting.id,
                title=meeting.title,
                description=meeting.description,
                start_time=meeting.start_time,
                end_time=meeting.end_time,
                transcript=meeting.transcript,
                summary=meeting.summary,
                participants=json.loads(meeting.participants or "[]"),
                created_at=meeting.created_at,
                updated_at=meeting.updated_at
            ))
        
        return response_meetings
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching meetings: {str(e)}"
        )

@router.get("/meetings/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(
    meeting_id: str,
    session: Session = Depends(get_session)
):
    """Get a specific meeting."""
    try:
        meeting = session.get(Meeting, meeting_id)
        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting not found"
            )
        
        return MeetingResponse(
            id=meeting.id,
            title=meeting.title,
            description=meeting.description,
            start_time=meeting.start_time,
            end_time=meeting.end_time,
            transcript=meeting.transcript,
            summary=meeting.summary,
            participants=json.loads(meeting.participants or "[]"),
            created_at=meeting.created_at,
            updated_at=meeting.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching meeting: {str(e)}"
        )

@router.put("/meetings/{meeting_id}/end")
async def end_meeting(
    meeting_id: str,
    session: Session = Depends(get_session)
):
    """End a meeting and finalize transcript."""
    try:
        meeting = session.get(Meeting, meeting_id)
        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting not found"
            )
        
        meeting.end_time = datetime.utcnow()
        meeting.updated_at = datetime.utcnow()
        
        session.commit()
        
        return {"message": "Meeting ended successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error ending meeting: {str(e)}"
        )

@router.get("/meetings/{meeting_id}/summary")
async def get_meeting_summary(
    meeting_id: str,
    session: Session = Depends(get_session)
):
    """Get meeting summary and insights."""
    try:
        meeting = session.get(Meeting, meeting_id)
        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting not found"
            )
        
        # Get all summaries for this meeting
        statement = select(Summary).where(Summary.meeting_id == meeting_id)
        summaries = session.exec(statement).all()
        
        # Get notes
        statement = select(Note).where(Note.meeting_id == meeting_id)
        notes = session.exec(statement).all()
        
        return {
            "meeting_id": meeting_id,
            "transcript": meeting.transcript,
            "summary": meeting.summary,
            "summaries": [
                {
                    "content": s.content,
                    "type": s.summary_type,
                    "timestamp": s.timestamp
                } for s in summaries
            ],
            "notes": [
                {
                    "content": n.content,
                    "author": n.author,
                    "created_at": n.created_at,
                    "updated_at": n.updated_at
                } for n in notes
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching meeting summary: {str(e)}"
        )

@router.post("/meetings/{meeting_id}/notes")
async def save_meeting_notes(
    meeting_id: str,
    notes_data: dict,
    session: Session = Depends(get_session)
):
    """Save meeting notes."""
    try:
        # Check if meeting exists
        meeting = session.get(Meeting, meeting_id)
        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting not found"
            )
        
        # Check if notes already exist
        statement = select(Note).where(Note.meeting_id == meeting_id)
        existing_note = session.exec(statement).first()
        
        if existing_note:
            existing_note.content = notes_data.get("content", "")
            existing_note.author = notes_data.get("author")
            existing_note.updated_at = datetime.utcnow()
        else:
            note = Note(
                meeting_id=meeting_id,
                content=notes_data.get("content", ""),
                author=notes_data.get("author"),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            session.add(note)
        
        session.commit()
        
        return {"message": "Notes saved successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving notes: {str(e)}"
        )

@router.delete("/meetings/{meeting_id}")
async def delete_meeting(
    meeting_id: str,
    session: Session = Depends(get_session)
):
    """Delete a meeting and all associated data."""
    try:
        meeting = session.get(Meeting, meeting_id)
        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting not found"
            )
        
        # Delete associated records
        statement = select(Summary).where(Summary.meeting_id == meeting_id)
        summaries = session.exec(statement).all()
        for summary in summaries:
            session.delete(summary)
        
        statement = select(Note).where(Note.meeting_id == meeting_id)
        notes = session.exec(statement).all()
        for note in notes:
            session.delete(note)
        
        statement = select(Transcript).where(Transcript.meeting_id == meeting_id)
        transcripts = session.exec(statement).all()
        for transcript in transcripts:
            session.delete(transcript)
        
        # Delete the meeting
        session.delete(meeting)
        session.commit()
        
        return {"message": "Meeting deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting meeting: {str(e)}"
        )
