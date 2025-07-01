'use client'

import JitsiEmbed from '@/components/JitsiEmbed'
import { StorageService } from '@/lib/storage'
import { ArrowLeftIcon, ShareIcon, UsersIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
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

export default function MeetingPage() {
  const params = useParams()
  const router = useRouter()
  const meetingId = params.id as string
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [userName, setUserName] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [participants, setParticipants] = useState<any[]>([])

  useEffect(() => {
    // Load meeting data
    loadMeeting()
    
    // Get or set user name
    const savedName = localStorage.getItem('userName') || `User_${Math.floor(Math.random() * 1000)}`
    setUserName(savedName)
    localStorage.setItem('userName', savedName)
  }, [meetingId])

  const loadMeeting = async () => {
    try {
      const meetingData = await StorageService.getMeeting(meetingId)
      if (meetingData) {
        setMeeting(meetingData)
      } else {
        // Create a new meeting if it doesn't exist
        const newMeeting: Meeting = {
          id: meetingId,
          title: `Meeting ${new Date().toLocaleDateString()}`,
          description: 'Meeting session',
          start_time: new Date().toISOString(),
          participants: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        await StorageService.saveMeeting(newMeeting)
        setMeeting(newMeeting)
      }
    } catch (error) {
      console.error('Error loading meeting:', error)
    }
  }

  const handleJoin = () => {
    setIsJoining(true)
    if (meeting) {
      // Update meeting with current participant
      const updatedMeeting = {
        ...meeting,
        participants: [...(meeting.participants || []), userName].filter((name, index, arr) => arr.indexOf(name) === index),
        updated_at: new Date().toISOString()
      }
      StorageService.saveMeeting(updatedMeeting)
      setMeeting(updatedMeeting)
    }
  }

  const handleLeave = () => {
    setIsJoining(false)
    if (meeting) {
      // Update meeting when leaving
      const updatedMeeting = {
        ...meeting,
        end_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      StorageService.saveMeeting(updatedMeeting)
    }
    router.push('/')
  }

  const handleParticipantJoined = (participant: any) => {
    console.log('Participant joined:', participant)
    setParticipants(prev => [...prev, participant])
  }

  const handleParticipantLeft = (participant: any) => {
    console.log('Participant left:', participant)
    setParticipants(prev => prev.filter(p => p.id !== participant.id))
  }

  const shareInvite = () => {
    const inviteUrl = `${window.location.origin}/meeting/join?room=${meetingId}`
    navigator.clipboard.writeText(inviteUrl).then(() => {
      alert('Meeting link copied to clipboard!')
    })
  }

  const changeName = () => {
    const newName = prompt('Enter your name:', userName)
    if (newName && newName.trim()) {
      setUserName(newName.trim())
      localStorage.setItem('userName', newName.trim())
    }
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading meeting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
                <h1 className="text-xl font-semibold">{meeting.title}</h1>
                <p className="text-sm text-muted-foreground">Meeting ID: {meetingId}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UsersIcon className="w-4 h-4" />
                <span>{participants.length + (isJoining ? 1 : 0)} participants</span>
              </div>
              <button
                onClick={shareInvite}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              >
                <ShareIcon className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={changeName}
                className="px-3 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
              >
                {userName}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Meeting Content */}
      <main className="container mx-auto px-4 py-6">
        {!isJoining ? (
          /* Pre-join Screen */
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-card border border-border rounded-xl p-8 mb-6">
              <h2 className="text-2xl font-semibold mb-4">Ready to join the meeting?</h2>
              <p className="text-muted-foreground mb-6">
                You're about to join "<strong>{meeting.title}</strong>"
              </p>
              
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Meeting is live</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Joining as: <strong>{userName}</strong>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={changeName}
                  className="px-4 py-2 text-sm border border-border hover:bg-secondary rounded-lg transition-colors"
                >
                  Change Name
                </button>
                <button
                  onClick={handleJoin}
                  className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors font-medium"
                >
                  Join Meeting
                </button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>By joining this meeting, you agree to our terms of service.</p>
            </div>
          </div>
        ) : (
          /* Meeting Interface */
          <div className="h-[calc(100vh-140px)] w-full">
            <JitsiEmbed
              roomName={meetingId}
              meetingId={meetingId}
              userName={userName}
              onJoin={handleJoin}
              onLeave={handleLeave}
              onParticipantJoined={handleParticipantJoined}
              onParticipantLeft={handleParticipantLeft}
            />
          </div>
        )}
      </main>
    </div>
  )
}
