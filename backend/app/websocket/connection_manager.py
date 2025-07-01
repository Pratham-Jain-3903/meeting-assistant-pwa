from fastapi import WebSocket
from typing import Dict, List, Set
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages WebSocket connections for real-time communication."""
    
    def __init__(self):
        # Meeting connections: meeting_id -> set of websockets
        self.meeting_connections: Dict[str, Set[WebSocket]] = {}
        # Notes connections: meeting_id -> set of websockets
        self.notes_connections: Dict[str, Set[WebSocket]] = {}
        # Store meeting transcripts in memory for quick access
        self.meeting_transcripts: Dict[str, str] = {}
    
    async def connect(self, websocket: WebSocket, meeting_id: str):
        """Connect a client to a meeting room."""
        await websocket.accept()
        
        if meeting_id not in self.meeting_connections:
            self.meeting_connections[meeting_id] = set()
        
        self.meeting_connections[meeting_id].add(websocket)
        logger.info(f"Client connected to meeting {meeting_id}. Total connections: {len(self.meeting_connections[meeting_id])}")
    
    async def connect_notes(self, websocket: WebSocket, meeting_id: str):
        """Connect a client for notes collaboration."""
        await websocket.accept()
        
        if meeting_id not in self.notes_connections:
            self.notes_connections[meeting_id] = set()
        
        self.notes_connections[meeting_id].add(websocket)
        logger.info(f"Notes client connected to meeting {meeting_id}")
    
    def disconnect(self, websocket: WebSocket, meeting_id: str):
        """Disconnect a client from a meeting room."""
        if meeting_id in self.meeting_connections:
            self.meeting_connections[meeting_id].discard(websocket)
            if not self.meeting_connections[meeting_id]:
                del self.meeting_connections[meeting_id]
        logger.info(f"Client disconnected from meeting {meeting_id}")
    
    def disconnect_notes(self, websocket: WebSocket, meeting_id: str):
        """Disconnect a notes client."""
        if meeting_id in self.notes_connections:
            self.notes_connections[meeting_id].discard(websocket)
            if not self.notes_connections[meeting_id]:
                del self.notes_connections[meeting_id]
        logger.info(f"Notes client disconnected from meeting {meeting_id}")
    
    async def broadcast_to_meeting(self, meeting_id: str, message: dict):
        """Broadcast a message to all clients in a meeting."""
        if meeting_id in self.meeting_connections:
            connections_to_remove = []
            
            for websocket in self.meeting_connections[meeting_id].copy():
                try:
                    await websocket.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Error broadcasting to client: {e}")
                    connections_to_remove.append(websocket)
            
            # Remove disconnected clients
            for websocket in connections_to_remove:
                self.meeting_connections[meeting_id].discard(websocket)
            
            # Update transcript cache
            if message.get("type") == "transcript":
                transcript_text = message.get("data", {}).get("text", "")
                if meeting_id not in self.meeting_transcripts:
                    self.meeting_transcripts[meeting_id] = ""
                self.meeting_transcripts[meeting_id] += f" {transcript_text}"
    
    async def broadcast_notes_to_meeting(self, meeting_id: str, message: dict, exclude: WebSocket = None):
        """Broadcast notes updates to all clients except the sender."""
        if meeting_id in self.notes_connections:
            connections_to_remove = []
            
            for websocket in self.notes_connections[meeting_id].copy():
                if websocket == exclude:
                    continue
                    
                try:
                    await websocket.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Error broadcasting notes to client: {e}")
                    connections_to_remove.append(websocket)
            
            # Remove disconnected clients
            for websocket in connections_to_remove:
                self.notes_connections[meeting_id].discard(websocket)
    
    async def send_error(self, websocket: WebSocket, error_message: str):
        """Send error message to a specific client."""
        try:
            await websocket.send_text(json.dumps({
                "type": "error",
                "message": error_message,
                "timestamp": "now"
            }))
        except Exception as e:
            logger.error(f"Error sending error message: {e}")
    
    def get_meeting_transcript(self, meeting_id: str) -> str:
        """Get the accumulated transcript for a meeting."""
        return self.meeting_transcripts.get(meeting_id, "")
    
    def get_connection_count(self, meeting_id: str) -> int:
        """Get number of active connections for a meeting."""
        return len(self.meeting_connections.get(meeting_id, set()))
    
    def get_all_meetings(self) -> List[str]:
        """Get list of active meeting IDs."""
        return list(self.meeting_connections.keys())
