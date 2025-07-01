import asyncio
import logging
from typing import Dict, Any, Optional, List
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import json
import os
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class CalendarService:
    """Service for Google Calendar integration."""
    
    SCOPES = ['https://www.googleapis.com/auth/calendar']
    
    def __init__(self):
        self.credentials_file = "credentials.json"
        self.token_file = "token.json"
        self.service = None
        
    async def initialize(self):
        """Initialize the Google Calendar service."""
        try:
            # Check if credentials file exists
            if not os.path.exists(self.credentials_file):
                logger.warning("Google credentials file not found. Calendar features will be disabled.")
                return
            
            # Load or refresh credentials
            creds = None
            if os.path.exists(self.token_file):
                creds = Credentials.from_authorized_user_file(self.token_file, self.SCOPES)
            
            # If there are no (valid) credentials available, let the user log in.
            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                else:
                    logger.info("Calendar service requires authentication")
                    return  # Will handle auth flow separately
            
            # Build the service
            loop = asyncio.get_event_loop()
            self.service = await loop.run_in_executor(
                None,
                lambda: build('calendar', 'v3', credentials=creds)
            )
            
            logger.info("Google Calendar service initialized")
            
        except Exception as e:
            logger.error(f"Error initializing Calendar service: {e}")
    
    def is_ready(self) -> bool:
        """Check if the calendar service is ready."""
        return self.service is not None
    
    async def get_auth_url(self) -> Optional[str]:
        """Get the authentication URL for OAuth flow."""
        try:
            if not os.path.exists(self.credentials_file):
                return None
            
            flow = Flow.from_client_secrets_file(
                self.credentials_file,
                scopes=self.SCOPES,
                redirect_uri='http://localhost:8000/api/auth/callback'
            )
            
            auth_url, _ = flow.authorization_url(prompt='consent')
            return auth_url
            
        except Exception as e:
            logger.error(f"Error getting auth URL: {e}")
            return None
    
    async def handle_auth_callback(self, authorization_code: str) -> bool:
        """Handle the OAuth callback and save credentials."""
        try:
            if not os.path.exists(self.credentials_file):
                return False
            
            flow = Flow.from_client_secrets_file(
                self.credentials_file,
                scopes=self.SCOPES,
                redirect_uri='http://localhost:8000/api/auth/callback'
            )
            
            # Exchange authorization code for credentials
            flow.fetch_token(code=authorization_code)
            creds = flow.credentials
            
            # Save credentials for future use
            with open(self.token_file, 'w') as token:
                token.write(creds.to_json())
            
            # Initialize service with new credentials
            loop = asyncio.get_event_loop()
            self.service = await loop.run_in_executor(
                None,
                lambda: build('calendar', 'v3', credentials=creds)
            )
            
            logger.info("Calendar authentication successful")
            return True
            
        except Exception as e:
            logger.error(f"Error handling auth callback: {e}")
            return False
    
    async def create_event(self, event_data: Dict[str, Any]) -> Optional[str]:
        """Create a calendar event from meeting action items."""
        if not self.is_ready():
            logger.warning("Calendar service not ready")
            return None
        
        try:
            # Build event object
            event = {
                'summary': event_data.get('title', 'Meeting Follow-up'),
                'description': event_data.get('description', ''),
                'start': {
                    'dateTime': event_data['start_time'].isoformat(),
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': event_data.get('end_time', 
                                            event_data['start_time'] + timedelta(hours=1)).isoformat(),
                    'timeZone': 'UTC',
                },
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},
                        {'method': 'popup', 'minutes': 30},
                    ],
                },
            }
            
            # Add attendees if provided
            if 'attendees' in event_data:
                event['attendees'] = [
                    {'email': email} for email in event_data['attendees']
                ]
            
            # Create the event
            loop = asyncio.get_event_loop()
            created_event = await loop.run_in_executor(
                None,
                lambda: self.service.events().insert(calendarId='primary', body=event).execute()
            )
            
            logger.info(f"Created calendar event: {created_event['id']}")
            return created_event['id']
            
        except HttpError as e:
            logger.error(f"HTTP error creating calendar event: {e}")
            return None
        except Exception as e:
            logger.error(f"Error creating calendar event: {e}")
            return None
    
    async def create_action_item_events(self, 
                                       meeting_id: str,
                                       action_items: List[str],
                                       base_date: datetime = None) -> List[str]:
        """Create calendar events for meeting action items."""
        if not action_items:
            return []
        
        if base_date is None:
            base_date = datetime.utcnow() + timedelta(days=1)  # Tomorrow
        
        created_events = []
        
        for i, action_item in enumerate(action_items):
            # Schedule action items with some spacing
            event_time = base_date + timedelta(hours=i * 2)
            
            event_data = {
                'title': f"Action Item: {action_item[:50]}{'...' if len(action_item) > 50 else ''}",
                'description': f"Action item from meeting {meeting_id}:\n\n{action_item}",
                'start_time': event_time,
                'end_time': event_time + timedelta(minutes=30)
            }
            
            event_id = await self.create_event(event_data)
            if event_id:
                created_events.append(event_id)
        
        logger.info(f"Created {len(created_events)} action item events")
        return created_events
    
    async def get_upcoming_events(self, max_results: int = 10) -> List[Dict[str, Any]]:
        """Get upcoming calendar events."""
        if not self.is_ready():
            return []
        
        try:
            # Get events from now until next week
            now = datetime.utcnow().isoformat() + 'Z'
            
            loop = asyncio.get_event_loop()
            events_result = await loop.run_in_executor(
                None,
                lambda: self.service.events().list(
                    calendarId='primary',
                    timeMin=now,
                    maxResults=max_results,
                    singleEvents=True,
                    orderBy='startTime'
                ).execute()
            )
            
            events = events_result.get('items', [])
            
            # Format events for response
            formatted_events = []
            for event in events:
                formatted_events.append({
                    'id': event['id'],
                    'title': event.get('summary', 'No Title'),
                    'start': event['start'].get('dateTime', event['start'].get('date')),
                    'end': event['end'].get('dateTime', event['end'].get('date')),
                    'description': event.get('description', ''),
                    'attendees': [attendee.get('email') for attendee in event.get('attendees', [])]
                })
            
            return formatted_events
            
        except Exception as e:
            logger.error(f"Error getting upcoming events: {e}")
            return []
    
    async def delete_event(self, event_id: str) -> bool:
        """Delete a calendar event."""
        if not self.is_ready():
            return False
        
        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: self.service.events().delete(calendarId='primary', eventId=event_id).execute()
            )
            
            logger.info(f"Deleted calendar event: {event_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting calendar event: {e}")
            return False
