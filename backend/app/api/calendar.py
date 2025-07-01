from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List, Dict, Any
from datetime import datetime

from app.services.calendar_service import CalendarService
from app.database import get_session
from app.models import CalendarEventCreate, Meeting

router = APIRouter()

# Global calendar service instance
calendar_service = CalendarService()

@router.post("/calendar/auth")
async def get_auth_url():
    """Get Google Calendar OAuth URL."""
    try:
        auth_url = await calendar_service.get_auth_url()
        if not auth_url:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="Google Calendar credentials not configured"
            )
        
        return {"auth_url": auth_url}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting auth URL: {str(e)}"
        )

@router.post("/calendar/auth/callback")
async def handle_auth_callback(callback_data: dict):
    """Handle OAuth callback from Google."""
    try:
        code = callback_data.get("code")
        if not code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Authorization code required"
            )
        
        success = await calendar_service.handle_auth_callback(code)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to authenticate with Google Calendar"
            )
        
        return {"message": "Calendar authentication successful"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error handling auth callback: {str(e)}"
        )

@router.post("/calendar/events")
async def create_calendar_event(event_data: CalendarEventCreate):
    """Create a calendar event."""
    try:
        if not calendar_service.is_ready():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Calendar service not available. Please authenticate first."
            )
        
        event_dict = {
            "title": event_data.title,
            "description": event_data.description,
            "start_time": event_data.start_time,
            "end_time": event_data.end_time
        }
        
        event_id = await calendar_service.create_event(event_dict)
        if not event_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create calendar event"
            )
        
        return {"event_id": event_id, "message": "Event created successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating calendar event: {str(e)}"
        )

@router.post("/calendar/export-action-items/{meeting_id}")
async def export_action_items(
    meeting_id: str,
    export_data: dict,
    session: Session = Depends(get_session)
):
    """Export meeting action items to Google Calendar."""
    try:
        if not calendar_service.is_ready():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Calendar service not available. Please authenticate first."
            )
        
        # Verify meeting exists
        meeting = session.get(Meeting, meeting_id)
        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting not found"
            )
        
        action_items = export_data.get("action_items", [])
        if not action_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No action items provided"
            )
        
        # Create calendar events for action items
        base_date = export_data.get("base_date")
        if base_date:
            base_date = datetime.fromisoformat(base_date.replace('Z', '+00:00'))
        
        created_events = await calendar_service.create_action_item_events(
            meeting_id=meeting_id,
            action_items=action_items,
            base_date=base_date
        )
        
        return {
            "message": f"Created {len(created_events)} calendar events",
            "event_ids": created_events
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error exporting action items: {str(e)}"
        )

@router.get("/calendar/events")
async def get_upcoming_events(max_results: int = 10):
    """Get upcoming calendar events."""
    try:
        if not calendar_service.is_ready():
            return {"events": [], "message": "Calendar service not available"}
        
        events = await calendar_service.get_upcoming_events(max_results)
        return {"events": events}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching calendar events: {str(e)}"
        )

@router.delete("/calendar/events/{event_id}")
async def delete_calendar_event(event_id: str):
    """Delete a calendar event."""
    try:
        if not calendar_service.is_ready():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Calendar service not available"
            )
        
        success = await calendar_service.delete_event(event_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete calendar event"
            )
        
        return {"message": "Event deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting calendar event: {str(e)}"
        )

@router.get("/calendar/status")
async def get_calendar_status():
    """Get calendar service status."""
    return {
        "is_ready": calendar_service.is_ready(),
        "message": "Ready" if calendar_service.is_ready() else "Authentication required"
    }
