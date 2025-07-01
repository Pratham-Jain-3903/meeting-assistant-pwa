'use client'

import { StorageService } from '@/lib/storage'
import { ArrowLeftIcon, ChartBarIcon, ClockIcon, DocumentTextIcon, UsersIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import Link from 'next/link'
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

export default function InsightsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMeetings: 0,
    totalDuration: 0,
    averageParticipants: 0,
    meetingsWithTranscripts: 0
  })

  useEffect(() => {
    loadMeetings()
  }, [])

  const loadMeetings = async () => {
    try {
      const allMeetings = await StorageService.getRecentMeetings(50) // Get more for analytics
      setMeetings(allMeetings)
      calculateStats(allMeetings)
    } catch (error) {
      console.error('Error loading meetings:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (meetings: Meeting[]) => {
    const totalMeetings = meetings.length
    let totalDuration = 0
    let totalParticipants = 0
    let meetingsWithTranscripts = 0

    meetings.forEach(meeting => {
      // Calculate duration
      if (meeting.end_time) {
        const duration = new Date(meeting.end_time).getTime() - new Date(meeting.start_time).getTime()
        totalDuration += duration
      }

      // Count participants
      if (meeting.participants) {
        totalParticipants += meeting.participants.length
      }

      // Count meetings with transcripts
      if (meeting.transcript) {
        meetingsWithTranscripts++
      }
    })

    setStats({
      totalMeetings,
      totalDuration: Math.round(totalDuration / (1000 * 60)), // Convert to minutes
      averageParticipants: totalMeetings > 0 ? Math.round(totalParticipants / totalMeetings * 10) / 10 : 0,
      meetingsWithTranscripts
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading insights...</p>
        </div>
      </div>
    )
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
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <ChartBarIcon className="w-8 h-8 text-primary" />
                Meeting Insights
              </h1>
              <p className="text-muted-foreground">Analytics and trends from your meetings</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Meetings</h3>
              <ClockIcon className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.totalMeetings}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Duration</h3>
              <ChartBarIcon className="w-5 h-5 text-accent" />
            </div>
            <p className="text-3xl font-bold">{formatDuration(stats.totalDuration)}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Avg. Participants</h3>
              <UsersIcon className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-3xl font-bold">{stats.averageParticipants}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">With Transcripts</h3>
              <DocumentTextIcon className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold">{stats.meetingsWithTranscripts}</p>
          </div>
        </div>

        {/* Recent Meetings List */}
        <section>
          <h2 className="text-xl font-semibold mb-6">All Meetings</h2>
          
          {meetings.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <ChartBarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No meetings yet</h3>
              <p className="text-muted-foreground mb-6">Start your first meeting to see analytics here</p>
              <Link
                href="/"
                className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Start Meeting
              </Link>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Meeting</th>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Duration</th>
                      <th className="text-left p-4 font-medium">Participants</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meetings.map((meeting, index) => {
                      const duration = meeting.end_time 
                        ? Math.round((new Date(meeting.end_time).getTime() - new Date(meeting.start_time).getTime()) / (1000 * 60))
                        : null
                      
                      return (
                        <tr key={meeting.id} className={index % 2 === 0 ? 'bg-background/50' : ''}>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{meeting.title}</p>
                              <p className="text-sm text-muted-foreground">ID: {meeting.id}</p>
                            </div>
                          </td>
                          <td className="p-4 text-sm">
                            <div>
                              <p>{format(new Date(meeting.start_time), 'MMM d, yyyy')}</p>
                              <p className="text-muted-foreground">{format(new Date(meeting.start_time), 'h:mm a')}</p>
                            </div>
                          </td>
                          <td className="p-4 text-sm">
                            {duration ? formatDuration(duration) : (
                              <span className="text-muted-foreground">Ongoing</span>
                            )}
                          </td>
                          <td className="p-4 text-sm">
                            {meeting.participants ? meeting.participants.length : 0}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                meeting.end_time ? 'bg-muted-foreground' : 'bg-green-500'
                              }`} />
                              <span className="text-sm">
                                {meeting.end_time ? 'Completed' : 'Live'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Link
                              href={`/meeting/${meeting.id}`}
                              className="text-sm text-primary hover:text-primary/80 font-medium"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
