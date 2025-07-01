import localforage from 'localforage'

// Configure localforage
localforage.config({
  name: 'MeetingAssistantPWA',
  version: 1.0,
  storeName: 'meetingData',
  description: 'Local storage for meeting assistant data'
})

export interface Meeting {
  id: string
  title: string
  description?: string
  start_time: string
  end_time?: string
  transcript?: string
  summary?: string
  participants?: string[]
  created_at: string
  updated_at: string
}

export interface MeetingNote {
  id: string
  meeting_id: string
  content: string
  author?: string
  created_at: string
  updated_at: string
}

export interface TranscriptChunk {
  id: string
  meeting_id: string
  text: string
  speaker?: string
  timestamp: string
  confidence?: number
}

export class StorageService {
  // Meeting storage
  static async saveMeeting(meeting: Meeting): Promise<void> {
    await localforage.setItem(`meeting_${meeting.id}`, meeting)
    
    // Update meetings index
    const meetings = await this.getAllMeetings()
    const existingIndex = meetings.findIndex(m => m.id === meeting.id)
    
    if (existingIndex >= 0) {
      meetings[existingIndex] = meeting
    } else {
      meetings.push(meeting)
    }
    
    // Sort by created_at (newest first)
    meetings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    await localforage.setItem('meetings_index', meetings)
  }

  static async getMeeting(meetingId: string): Promise<Meeting | null> {
    return await localforage.getItem(`meeting_${meetingId}`)
  }

  static async getAllMeetings(): Promise<Meeting[]> {
    const meetings = await localforage.getItem<Meeting[]>('meetings_index')
    return meetings || []
  }

  static async getRecentMeetings(limit: number = 10): Promise<Meeting[]> {
    const meetings = await this.getAllMeetings()
    return meetings.slice(0, limit)
  }

  static async deleteMeeting(meetingId: string): Promise<void> {
    await localforage.removeItem(`meeting_${meetingId}`)
    
    // Update meetings index
    const meetings = await this.getAllMeetings()
    const filteredMeetings = meetings.filter(m => m.id !== meetingId)
    await localforage.setItem('meetings_index', filteredMeetings)
    
    // Clean up related data
    await this.deleteMeetingNotes(meetingId)
    await this.deleteMeetingTranscript(meetingId)
  }

  // Notes storage
  static async saveMeetingNotes(note: MeetingNote): Promise<void> {
    await localforage.setItem(`notes_${note.meeting_id}`, note)
  }

  static async getMeetingNotes(meetingId: string): Promise<MeetingNote | null> {
    return await localforage.getItem(`notes_${meetingId}`)
  }

  static async deleteMeetingNotes(meetingId: string): Promise<void> {
    await localforage.removeItem(`notes_${meetingId}`)
  }

  // Transcript storage
  static async saveTranscriptChunk(chunk: TranscriptChunk): Promise<void> {
    const existingChunks = await this.getMeetingTranscript(chunk.meeting_id)
    const updatedChunks = [...existingChunks, chunk]
    
    await localforage.setItem(`transcript_${chunk.meeting_id}`, updatedChunks)
  }

  static async getMeetingTranscript(meetingId: string): Promise<TranscriptChunk[]> {
    const transcript = await localforage.getItem<TranscriptChunk[]>(`transcript_${meetingId}`)
    return transcript || []
  }

  static async updateTranscript(meetingId: string, chunks: TranscriptChunk[]): Promise<void> {
    await localforage.setItem(`transcript_${meetingId}`, chunks)
  }

  static async deleteMeetingTranscript(meetingId: string): Promise<void> {
    await localforage.removeItem(`transcript_${meetingId}`)
  }

  // Settings storage
  static async saveSettings(settings: Record<string, any>): Promise<void> {
    await localforage.setItem('app_settings', settings)
  }

  static async getSettings(): Promise<Record<string, any>> {
    const settings = await localforage.getItem<Record<string, any>>('app_settings')
    return settings || {
      theme: 'dark',
      audioInputDevice: 'default',
      transcriptionLanguage: 'en',
      enableNotifications: true,
      autoSave: true
    }
  }

  // Cache management
  static async clearCache(): Promise<void> {
    await localforage.clear()
  }

  static async getCacheSize(): Promise<number> {
    const keys = await localforage.keys()
    let totalSize = 0
    
    for (const key of keys) {
      const item = await localforage.getItem(key)
      if (item) {
        totalSize += JSON.stringify(item).length
      }
    }
    
    return totalSize
  }

  // Sync status (for offline/online sync)
  static async markForSync(type: 'meeting' | 'notes' | 'transcript', id: string): Promise<void> {
    const syncQueue = await this.getSyncQueue()
    
    if (!syncQueue.some(item => item.type === type && item.id === id)) {
      syncQueue.push({
        type,
        id,
        timestamp: new Date().toISOString()
      })
      
      await localforage.setItem('sync_queue', syncQueue)
    }
  }

  static async getSyncQueue(): Promise<Array<{type: string, id: string, timestamp: string}>> {
    const queue = await localforage.getItem<Array<{type: string, id: string, timestamp: string}>>('sync_queue')
    return queue || []
  }

  static async clearSyncQueue(): Promise<void> {
    await localforage.setItem('sync_queue', [])
  }

  static async removeSyncItem(type: string, id: string): Promise<void> {
    const syncQueue = await this.getSyncQueue()
    const filteredQueue = syncQueue.filter(item => !(item.type === type && item.id === id))
    await localforage.setItem('sync_queue', filteredQueue)
  }

  // Search functionality
  static async searchMeetings(query: string): Promise<Meeting[]> {
    const meetings = await this.getAllMeetings()
    
    if (!query.trim()) {
      return meetings
    }
    
    const lowercaseQuery = query.toLowerCase()
    
    return meetings.filter(meeting => 
      meeting.title.toLowerCase().includes(lowercaseQuery) ||
      meeting.description?.toLowerCase().includes(lowercaseQuery) ||
      meeting.transcript?.toLowerCase().includes(lowercaseQuery) ||
      meeting.summary?.toLowerCase().includes(lowercaseQuery)
    )
  }

  // Export functionality
  static async exportMeetingData(meetingId: string): Promise<{
    meeting: Meeting | null,
    notes: MeetingNote | null,
    transcript: TranscriptChunk[]
  }> {
    const [meeting, notes, transcript] = await Promise.all([
      this.getMeeting(meetingId),
      this.getMeetingNotes(meetingId),
      this.getMeetingTranscript(meetingId)
    ])

    return { meeting, notes, transcript }
  }

  // Import functionality
  static async importMeetingData(data: {
    meeting: Meeting,
    notes?: MeetingNote,
    transcript?: TranscriptChunk[]
  }): Promise<void> {
    await this.saveMeeting(data.meeting)
    
    if (data.notes) {
      await this.saveMeetingNotes(data.notes)
    }
    
    if (data.transcript && data.transcript.length > 0) {
      await this.updateTranscript(data.meeting.id, data.transcript)
    }
  }
}
