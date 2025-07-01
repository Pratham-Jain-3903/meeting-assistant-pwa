'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PlusIcon, ClockIcon, ChartBarIcon, CogIcon } from '@heroicons/react/24/outline'
import { StorageService } from '@/lib/storage'
import { formatDistanceToNow } from 'date-fns'

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

export default function HomePage() {
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadRecentMeetings()
  }, [])

  const loadRecentMeetings = async () => {
    try {
      const meetings = await StorageService.getRecentMeetings(5)
      setRecentMeetings(meetings)
    } catch (error) {
      console.error('Error loading recent meetings:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNewMeeting = async () => {
    try {
      const meetingId = `meeting_${Date.now()}`
      const newMeeting: Meeting = {
        id: meetingId,
        title: `Meeting ${new Date().toLocaleDateString()}`,
        description: 'New meeting session',
        start_time: new Date().toISOString(),
        participants: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      await StorageService.saveMeeting(newMeeting)
      router.push(`/meeting/${meetingId}`)
    } catch (error) {
      console.error('Error creating meeting:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">AI Meeting Assistant</h1>
              <p className="text-muted-foreground mt-1">Transform conversations into insights</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/insights"
                className="flex items-center gap-2 px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              >
                <ChartBarIcon className="w-4 h-4" />
                Analytics
              </Link>
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <CogIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Start New Meeting */}
          <button
            onClick={createNewMeeting}
            className="group relative p-8 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-xl hover:from-primary/30 hover:to-primary/10 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                <PlusIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Start New Meeting</h3>
              <p className="text-muted-foreground">Begin a new meeting with real-time transcription</p>
            </div>
          </button>

          {/* Join Existing Meeting */}
          <Link
            href="/meeting/join"
            className="group relative p-8 bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 rounded-xl hover:from-accent/30 hover:to-accent/10 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
                <ClockIcon className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Join Meeting</h3>
              <p className="text-muted-foreground">Join an existing meeting session</p>
            </div>
          </Link>

          {/* View Insights */}
          <Link
            href="/insights"
            className="group relative p-8 bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20 rounded-xl hover:from-secondary/30 hover:to-secondary/10 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-secondary/30 transition-colors">
                <ChartBarIcon className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">View Insights</h3>
              <p className="text-muted-foreground">Analyze past meetings and trends</p>
            </div>
          </Link>
        </div>

        {/* Recent Meetings */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Recent Meetings</h2>
            <Link
              href="/insights"
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-6 bg-card border border-border rounded-xl animate-pulse">
                  <div className="h-4 bg-muted rounded mb-3"></div>
                  <div className="h-3 bg-muted rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recentMeetings.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No recent meetings</h3>
              <p className="text-muted-foreground mb-6">Start your first meeting to see it here</p>
              <button
                onClick={createNewMeeting}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Start Meeting
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentMeetings.map((meeting) => (
                <Link
                  key={meeting.id}
                  href={`/meeting/${meeting.id}`}
                  className="group p-6 bg-card border border-border rounded-xl hover:border-primary/50 transition-all duration-200 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium group-hover:text-primary transition-colors line-clamp-1">
                      {meeting.title}
                    </h3>
                    <span className={`w-2 h-2 rounded-full ${
                      meeting.end_time ? 'bg-muted-foreground' : 'bg-green-500'
                    }`} />
                  </div>
                  
                  {meeting.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {meeting.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(meeting.start_time), { addSuffix: true })}
                    </span>
                    {meeting.participants && meeting.participants.length > 0 && (
                      <span>{meeting.participants.length} participants</span>
                    )}
                  </div>
                  
                  {meeting.transcript && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Transcript available</span>
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Features Overview */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">Powerful Meeting Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Real-time Transcription',
                description: 'Live speech-to-text with speaker identification',
                icon: '🎤'
              },
              {
                title: 'AI Summarization',
                description: 'Automatic meeting summaries and key points',
                icon: '🤖'
              },
              {
                title: 'Collaborative Notes',
                description: 'Real-time collaborative note-taking',
                icon: '📝'
              },
              {
                title: 'Calendar Sync',
                description: 'Export action items to Google Calendar',
                icon: '📅'
              }
            ].map((feature, index) => (
              <div key={index} className="p-6 bg-card/50 border border-border/50 rounded-xl text-center">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-medium mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
