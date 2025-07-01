export interface WebSocketMessage {
  type: 'transcript' | 'summary' | 'sentiment' | 'rag_insights' | 'error' | 'connection_status'
  data: any
  timestamp: string
}

export interface TranscriptMessage {
  text: string
  speaker?: string
  confidence?: number
  language?: string
}

export interface SummaryMessage {
  summary: string
  action_items: string[]
  word_count: number
  summary_ratio: number
}

export interface SentimentMessage {
  label: string
  score: number
  confidence: string
}

export interface RAGInsightsMessage {
  enhanced_summary: string
  relevant_context: string[]
  context_sources: any[]
}

export class WebSocketService {
  private ws: WebSocket | null = null
  private meetingId: string | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isReconnecting = false

  // Event handlers
  private onTranscriptHandler?: (data: TranscriptMessage) => void
  private onSummaryHandler?: (data: SummaryMessage) => void
  private onSentimentHandler?: (data: SentimentMessage) => void
  private onRAGInsightsHandler?: (data: RAGInsightsMessage) => void
  private onErrorHandler?: (error: string) => void
  private onConnectionStatusHandler?: (status: string) => void

  constructor() {
    // Bind methods to preserve context
    this.handleMessage = this.handleMessage.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleError = this.handleError.bind(this)
    this.handleOpen = this.handleOpen.bind(this)
  }

  connect(meetingId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.meetingId = meetingId
      
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws/meeting/${meetingId}`
      
      try {
        this.ws = new WebSocket(wsUrl)
        
        this.ws.onopen = (event) => {
          this.handleOpen(event)
          resolve()
        }
        
        this.ws.onmessage = this.handleMessage
        this.ws.onclose = this.handleClose
        this.ws.onerror = (event) => {
          this.handleError(event)
          reject(new Error('WebSocket connection failed'))
        }
        
        // Timeout for connection
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            reject(new Error('WebSocket connection timeout'))
          }
        }, 10000)
        
      } catch (error) {
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.meetingId = null
    this.reconnectAttempts = 0
    this.isReconnecting = false
  }

  sendAudioData(audioData: ArrayBuffer): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(audioData)
    } else {
      console.warn('WebSocket not connected, cannot send audio data')
    }
  }

  sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not connected, cannot send message')
    }
  }

  private handleOpen(event: Event): void {
    console.log('WebSocket connected')
    this.reconnectAttempts = 0
    this.isReconnecting = false
    this.onConnectionStatusHandler?.('connected')
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)
      
      switch (message.type) {
        case 'transcript':
          this.onTranscriptHandler?.(message.data)
          break
        case 'summary':
          this.onSummaryHandler?.(message.data)
          break
        case 'sentiment':
          this.onSentimentHandler?.(message.data)
          break
        case 'rag_insights':
          this.onRAGInsightsHandler?.(message.data)
          break
        case 'error':
          this.onErrorHandler?.(message.data)
          break
        case 'connection_status':
          this.onConnectionStatusHandler?.(message.data)
          break
        default:
          console.log('Unknown message type:', message.type)
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error)
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket closed:', event.code, event.reason)
    this.onConnectionStatusHandler?.('disconnected')
    
    // Attempt to reconnect if not manually closed
    if (event.code !== 1000 && this.meetingId && !this.isReconnecting) {
      this.attemptReconnect()
    }
  }

  private handleError(event: Event): void {
    console.error('WebSocket error:', event)
    this.onErrorHandler?.('WebSocket connection error')
  }

  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts || this.isReconnecting) {
      return
    }

    this.isReconnecting = true
    this.reconnectAttempts++
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
    this.onConnectionStatusHandler?.('reconnecting')

    await new Promise(resolve => setTimeout(resolve, this.reconnectDelay))

    try {
      if (this.meetingId) {
        await this.connect(this.meetingId)
      }
    } catch (error) {
      console.error('Reconnection failed:', error)
      this.isReconnecting = false
      
      // Exponential backoff
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000)
      
      // Try again
      this.attemptReconnect()
    }
  }

  // Event handler setters
  onTranscript(handler: (data: TranscriptMessage) => void): void {
    this.onTranscriptHandler = handler
  }

  onSummary(handler: (data: SummaryMessage) => void): void {
    this.onSummaryHandler = handler
  }

  onSentiment(handler: (data: SentimentMessage) => void): void {
    this.onSentimentHandler = handler
  }

  onRAGInsights(handler: (data: RAGInsightsMessage) => void): void {
    this.onRAGInsightsHandler = handler
  }

  onError(handler: (error: string) => void): void {
    this.onErrorHandler = handler
  }

  onConnectionStatus(handler: (status: string) => void): void {
    this.onConnectionStatusHandler = handler
  }

  // Getters
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  get connectionState(): string {
    if (!this.ws) return 'disconnected'
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting'
      case WebSocket.OPEN: return 'connected'
      case WebSocket.CLOSING: return 'closing'
      case WebSocket.CLOSED: return 'disconnected'
      default: return 'unknown'
    }
  }
}

// Notes WebSocket Service for collaborative editing
export class NotesWebSocketService {
  private ws: WebSocket | null = null
  private meetingId: string | null = null
  private onUpdateHandler?: (update: any) => void
  private onErrorHandler?: (error: string) => void

  connect(meetingId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.meetingId = meetingId
      
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws/notes/${meetingId}`
      
      try {
        this.ws = new WebSocket(wsUrl)
        
        this.ws.onopen = () => {
          console.log('Notes WebSocket connected')
          resolve()
        }
        
        this.ws.onmessage = (event) => {
          try {
            const update = JSON.parse(event.data)
            this.onUpdateHandler?.(update)
          } catch (error) {
            console.error('Error parsing notes update:', error)
          }
        }
        
        this.ws.onclose = () => {
          console.log('Notes WebSocket closed')
        }
        
        this.ws.onerror = (event) => {
          console.error('Notes WebSocket error:', event)
          this.onErrorHandler?.('Notes WebSocket error')
          reject(new Error('Notes WebSocket connection failed'))
        }
        
      } catch (error) {
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.meetingId = null
  }

  sendUpdate(update: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(update))
    }
  }

  onUpdate(handler: (update: any) => void): void {
    this.onUpdateHandler = handler
  }

  onError(handler: (error: string) => void): void {
    this.onErrorHandler = handler
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}
