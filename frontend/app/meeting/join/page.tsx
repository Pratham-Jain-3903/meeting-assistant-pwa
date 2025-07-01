'use client'

import { StorageService } from '@/lib/storage'
import { ArrowLeftIcon, ClockIcon, UsersIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Meeting {
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

export default function JoinMeetingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [meetingId, setMeetingId] = useState('')
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(false)
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    // Pre-fill meeting ID from URL params if available
    const roomParam = searchParams.get('room')
    if (roomParam) {
      setMeetingId(roomParam)
    }

    // Load saved user name
    const savedName = localStorage.getItem('userName') || ''
    setUserName(savedName)

    // Load recent meetings
    loadRecentMeetings()
  }, [searchParams])

  const loadRecentMeetings = async () => {
    try {
      const meetings = await StorageService.getRecentMeetings(5)
      setRecentMeetings(meetings)
    } catch (error) {
      console.error('Error loading recent meetings:', error)
    }
  }

  const joinMeeting = async () => {
    if (!meetingId.trim()) {
      setError('Please enter a meeting ID')
      return
    }

    if (!userName.trim()) {
      setError('Please enter your name')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Save user name
      localStorage.setItem('userName', userName.trim())

      // Check if meeting exists, if not create it
      let meeting = await StorageService.getMeeting(meetingId.trim())
      if (!meeting) {
        meeting = {
          id: meetingId.trim(),
          title: `Meeting ${new Date().toLocaleDateString()}`,
          description: 'Joined meeting session',
          start_time: new Date().toISOString(),
          participants: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        await StorageService.saveMeeting(meeting)
      }

      // Navigate to the meeting
      router.push(`/meeting/${meetingId.trim()}`)
    } catch (error) {
      console.error('Error joining meeting:', error)
      setError('Failed to join meeting. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const joinRecentMeeting = (meeting: Meeting) => {
    setMeetingId(meeting.id)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      joinMeeting()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Home
            </Link>
            <div className="h-6 w-px bg-border"></div>
            <div>
              <h1 className="text-2xl font-bold">Join Meeting</h1>
              <p className="text-muted-foreground">Enter a meeting ID to join an existing session</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Join Form */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <h2 className="text-xl font-semibold mb-6 text-center">Enter Meeting Details</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="meetingId" className="block text-sm font-medium mb-2">
                  Meeting ID
                </label>
                <input
                  id="meetingId"
                  type="text"
                  value={meetingId}
                  onChange={(e) => setMeetingId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter meeting ID"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="userName" className="block text-sm font-medium mb-2">
                  Your Name
                </label>
                <input
                  id="userName"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <button
                onClick={joinMeeting}
                disabled={loading}
                className="w-full px-4 py-3 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
              >
                {loading ? 'Joining...' : 'Join Meeting'}
              </button>
            </div>
          </div>

          {/* Recent Meetings */}
          {recentMeetings.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                Recent Meetings
              </h3>
              
              <div className="space-y-3">
                {recentMeetings.map((meeting) => (
                  <button
                    key={meeting.id}
                    onClick={() => joinRecentMeeting(meeting)}
                    className="w-full p-3 text-left border border-border hover:border-primary/50 hover:bg-secondary/50 rounded-lg transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{meeting.title}</p>
                        <p className="text-xs text-muted-foreground">ID: {meeting.id}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {meeting.participants && meeting.participants.length > 0 && (
                          <div className="flex items-center gap-1">
                            <UsersIcon className="w-3 h-3" />
                            <span>{meeting.participants.length}</span>
                          </div>
                        )}
                        <div className={`w-2 h-2 rounded-full ${
                          meeting.end_time ? 'bg-muted-foreground' : 'bg-green-500'
                        }`} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Don't have a meeting ID?
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-border hover:bg-secondary rounded-lg transition-colors"
            >
              Start a new meeting
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
