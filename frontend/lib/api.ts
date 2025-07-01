const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface APIResponse<T> {
  data?: T
  message?: string
  error?: string
}

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

export interface MeetingCreate {
  title: string
  description?: string
  start_time: string
  participants?: string[]
}

export interface CalendarEvent {
  title: string
  description?: string
  start_time: string
  end_time?: string
  action_items?: string[]
}

export class APIService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, requestOptions)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error ${response.status}: ${errorText}`)
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      } else {
        return {} as T
      }
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Meeting API
  static async createMeeting(meeting: MeetingCreate): Promise<Meeting> {
    return this.request<Meeting>('/api/meetings', {
      method: 'POST',
      body: JSON.stringify(meeting),
    })
  }

  static async getMeetings(skip: number = 0, limit: number = 100): Promise<Meeting[]> {
    return this.request<Meeting[]>(`/api/meetings?skip=${skip}&limit=${limit}`)
  }

  static async getMeeting(meetingId: string): Promise<Meeting> {
    return this.request<Meeting>(`/api/meetings/${meetingId}`)
  }

  static async endMeeting(meetingId: string): Promise<APIResponse<any>> {
    return this.request<APIResponse<any>>(`/api/meetings/${meetingId}/end`, {
      method: 'PUT',
    })
  }

  static async getMeetingSummary(meetingId: string): Promise<any> {
    return this.request<any>(`/api/meetings/${meetingId}/summary`)
  }

  static async saveMeetingNotes(meetingId: string, notesData: any): Promise<APIResponse<any>> {
    return this.request<APIResponse<any>>(`/api/meetings/${meetingId}/notes`, {
      method: 'POST',
      body: JSON.stringify(notesData),
    })
  }

  static async deleteMeeting(meetingId: string): Promise<APIResponse<any>> {
    return this.request<APIResponse<any>>(`/api/meetings/${meetingId}`, {
      method: 'DELETE',
    })
  }

  static async uploadAudio(meetingId: string, audioFile: File): Promise<any> {
    const formData = new FormData()
    formData.append('audio_file', audioFile)

    return this.request<any>(`/api/meetings/${meetingId}/upload-audio`, {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    })
  }

  // Calendar API
  static async getCalendarAuthUrl(): Promise<{ auth_url: string }> {
    return this.request<{ auth_url: string }>('/api/calendar/auth', {
      method: 'POST',
    })
  }

  static async handleCalendarCallback(code: string): Promise<APIResponse<any>> {
    return this.request<APIResponse<any>>('/api/calendar/auth/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  }

  static async createCalendarEvent(event: CalendarEvent): Promise<{ event_id: string }> {
    return this.request<{ event_id: string }>('/api/calendar/events', {
      method: 'POST',
      body: JSON.stringify(event),
    })
  }

  static async exportActionItems(
    meetingId: string,
    actionItems: string[],
    baseDate?: string
  ): Promise<{ event_ids: string[] }> {
    return this.request<{ event_ids: string[] }>(`/api/calendar/export-action-items/${meetingId}`, {
      method: 'POST',
      body: JSON.stringify({
        action_items: actionItems,
        base_date: baseDate,
      }),
    })
  }

  static async getUpcomingEvents(maxResults: number = 10): Promise<{ events: any[] }> {
    return this.request<{ events: any[] }>(`/api/calendar/events?max_results=${maxResults}`)
  }

  static async deleteCalendarEvent(eventId: string): Promise<APIResponse<any>> {
    return this.request<APIResponse<any>>(`/api/calendar/events/${eventId}`, {
      method: 'DELETE',
    })
  }

  static async getCalendarStatus(): Promise<{ is_ready: boolean; message: string }> {
    return this.request<{ is_ready: boolean; message: string }>('/api/calendar/status')
  }

  // Auth API
  static async login(provider: string, code: string): Promise<{ token: string }> {
    return this.request<{ token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ provider, code }),
    })
  }

  static async logout(): Promise<APIResponse<any>> {
    return this.request<APIResponse<any>>('/api/auth/logout', {
      method: 'POST',
    })
  }

  static async getAuthStatus(): Promise<{ authenticated: boolean; user: any }> {
    return this.request<{ authenticated: boolean; user: any }>('/api/auth/status')
  }

  // Health check
  static async healthCheck(): Promise<any> {
    return this.request<any>('/health')
  }
}

// Utility functions
export class APIUtils {
  static isNetworkError(error: Error): boolean {
    return error.message.includes('NetworkError') || 
           error.message.includes('fetch')
  }

  static isServerError(error: Error): boolean {
    return error.message.includes('5') && error.message.includes('API Error')
  }

  static isClientError(error: Error): boolean {
    return error.message.includes('4') && error.message.includes('API Error')
  }

  static getErrorMessage(error: Error): string {
    if (this.isNetworkError(error)) {
      return 'Network connection failed. Please check your internet connection.'
    } else if (this.isServerError(error)) {
      return 'Server error. Please try again later.'
    } else if (this.isClientError(error)) {
      return 'Request failed. Please check your input and try again.'
    } else {
      return error.message || 'An unexpected error occurred.'
    }
  }
}

// Request retry logic
export class RetryableAPIService extends APIService {
  private static async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.request<T>(endpoint, options)
      } catch (error) {
        lastError = error as Error

        // Don't retry client errors (4xx)
        if (APIUtils.isClientError(lastError)) {
          throw lastError
        }

        // Don't retry on last attempt
        if (attempt === maxRetries) {
          break
        }

        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }

    throw lastError!
  }

  // Override parent methods with retry logic
  static async createMeeting(meeting: MeetingCreate): Promise<Meeting> {
    return this.requestWithRetry<Meeting>('/api/meetings', {
      method: 'POST',
      body: JSON.stringify(meeting),
    })
  }

  static async getMeetings(skip: number = 0, limit: number = 100): Promise<Meeting[]> {
    return this.requestWithRetry<Meeting[]>(`/api/meetings?skip=${skip}&limit=${limit}`)
  }

  // Add retry logic to other critical methods as needed
}
