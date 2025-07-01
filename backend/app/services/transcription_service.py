import whisper
import torch
import asyncio
import logging
import io
import wave
import numpy as np
from pydub import AudioSegment
from typing import Dict, Any, Optional
import tempfile
import os

logger = logging.getLogger(__name__)

class TranscriptionService:
    """Service for real-time audio transcription using Whisper."""
    
    def __init__(self, model_size: str = "base"):
        self.model_size = model_size
        self.model = None
        self.audio_buffer = bytearray()
        self.is_processing = False
        self.sample_rate = 16000
        self.chunk_duration = 3.0  # seconds
        self.min_chunk_size = int(self.sample_rate * self.chunk_duration)
    
    async def initialize(self):
        """Initialize the Whisper model."""
        try:
            logger.info(f"Loading Whisper model: {self.model_size}")
            # Load model in a thread to avoid blocking
            loop = asyncio.get_event_loop()
            self.model = await loop.run_in_executor(
                None, 
                lambda: whisper.load_model(self.model_size)
            )
            logger.info("Whisper model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading Whisper model: {e}")
            raise
    
    def is_ready(self) -> bool:
        """Check if the service is ready."""
        return self.model is not None
    
    async def process_audio_chunk(self, audio_data: bytes) -> Optional[Dict[str, Any]]:
        """Process incoming audio chunk for transcription."""
        if not self.is_ready():
            logger.warning("Transcription service not ready")
            return None
        
        # Add to buffer
        self.audio_buffer.extend(audio_data)
        
        # Check if we have enough data to process
        if len(self.audio_buffer) < self.min_chunk_size * 2:  # 2 bytes per sample
            return None
        
        # Don't process if already processing
        if self.is_processing:
            return None
        
        try:
            self.is_processing = True
            
            # Extract chunk for processing
            chunk_data = bytes(self.audio_buffer[:self.min_chunk_size * 2])
            self.audio_buffer = self.audio_buffer[self.min_chunk_size:]
            
            # Convert to numpy array
            audio_np = self._bytes_to_numpy(chunk_data)
            
            # Transcribe
            result = await self._transcribe_audio(audio_np)
            
            if result and result.get("text", "").strip():
                return {
                    "text": result["text"].strip(),
                    "confidence": getattr(result, 'confidence', None),
                    "language": getattr(result, 'language', 'en')
                }
            
        except Exception as e:
            logger.error(f"Error processing audio chunk: {e}")
        finally:
            self.is_processing = False
        
        return None
    
    async def transcribe_file(self, file_path: str) -> str:
        """Transcribe an entire audio file."""
        if not self.is_ready():
            raise RuntimeError("Transcription service not ready")
        
        try:
            logger.info(f"Transcribing file: {file_path}")
            
            # Run transcription in executor to avoid blocking
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: self.model.transcribe(file_path)
            )
            
            return result["text"]
            
        except Exception as e:
            logger.error(f"Error transcribing file: {e}")
            raise
    
    async def _transcribe_audio(self, audio_np: np.ndarray) -> Optional[Dict[str, Any]]:
        """Transcribe numpy audio array."""
        try:
            # Ensure audio is in the right format
            audio_np = audio_np.astype(np.float32)
            
            # Normalize audio
            if audio_np.max() > 1.0:
                audio_np = audio_np / np.max(np.abs(audio_np))
            
            # Run transcription in executor
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: self.model.transcribe(audio_np, fp16=False)
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Error in transcription: {e}")
            return None
    
    def _bytes_to_numpy(self, audio_bytes: bytes) -> np.ndarray:
        """Convert raw audio bytes to numpy array."""
        try:
            # Assume 16-bit PCM audio
            audio_np = np.frombuffer(audio_bytes, dtype=np.int16)
            # Convert to float32 and normalize
            audio_np = audio_np.astype(np.float32) / 32768.0
            return audio_np
        except Exception as e:
            logger.error(f"Error converting bytes to numpy: {e}")
            return np.array([])
    
    def _convert_audio_format(self, audio_data: bytes, target_sample_rate: int = 16000) -> bytes:
        """Convert audio to the required format."""
        try:
            # Create AudioSegment from raw data
            audio = AudioSegment.from_file(io.BytesIO(audio_data))
            
            # Convert to mono and target sample rate
            audio = audio.set_channels(1)
            audio = audio.set_frame_rate(target_sample_rate)
            audio = audio.set_sample_width(2)  # 16-bit
            
            return audio.raw_data
            
        except Exception as e:
            logger.error(f"Error converting audio format: {e}")
            return audio_data
    
    def clear_buffer(self):
        """Clear the audio buffer."""
        self.audio_buffer.clear()
        logger.info("Audio buffer cleared")
    
    def get_buffer_size(self) -> int:
        """Get current buffer size in bytes."""
        return len(self.audio_buffer)
