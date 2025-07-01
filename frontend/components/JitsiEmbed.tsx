'use client'

import { useEffect, useRef, useState } from 'react'

interface JitsiEmbedProps {
  roomName: string
  meetingId: string
  userName?: string
  onJoin?: () => void
  onLeave?: () => void
  onParticipantJoined?: (participant: any) => void
  onParticipantLeft?: (participant: any) => void
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any
  }
}

export default function JitsiEmbed({
  roomName,
  meetingId,
  userName = 'Anonymous',
  onJoin,
  onLeave,
  onParticipantJoined,
  onParticipantLeft
}: JitsiEmbedProps) {
  const jitsiRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [participantCount, setParticipantCount] = useState(0)

  useEffect(() => {
    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve(window.JitsiMeetExternalAPI)
          return
        }

        const script = document.createElement('script')
        script.src = 'https://meet.jit.si/external_api.js'
        script.async = true
        script.onload = () => resolve(window.JitsiMeetExternalAPI)
        script.onerror = reject
        document.head.appendChild(script)
      })
    }

    const initializeJitsi = async () => {
      try {
        await loadJitsiScript()
        
        if (!jitsiRef.current) return

        // Clean up any existing API instance
        if (apiRef.current) {
          apiRef.current.dispose()
        }

        const domain = 'meet.jit.si'
        const options = {
          roomName: roomName || `meeting_${meetingId}`,
          width: '100%',
          height: '100%',
          parentNode: jitsiRef.current,
          userInfo: {
            displayName: userName,
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            enableWelcomePage: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'fodeviceselection',
              'hangup',
              'profile',
              'chat',
              'recording',
              'livestreaming',
              'etherpad',
              'sharedvideo',
              'settings',
              'raisehand',
              'videoquality',
              'filmstrip',
              'invite',
              'feedback',
              'stats',
              'shortcuts',
              'tileview',
              'videobackgroundblur',
              'download',
              'help',
              'mute-everyone',
              'security'
            ],
            SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: '',
            SHOW_POWERED_BY: false,
            DISPLAY_WELCOME_PAGE_CONTENT: false,
            DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
            APP_NAME: 'AI Meeting Assistant',
            NATIVE_APP_NAME: 'AI Meeting Assistant',
          }
        }

        apiRef.current = new window.JitsiMeetExternalAPI(domain, options)

        // Event listeners
        apiRef.current.addEventListener('videoConferenceJoined', (event: any) => {
          console.log('Joined conference:', event)
          setIsLoading(false)
          onJoin?.()
        })

        apiRef.current.addEventListener('videoConferenceLeft', (event: any) => {
          console.log('Left conference:', event)
          onLeave?.()
        })

        apiRef.current.addEventListener('participantJoined', (event: any) => {
          console.log('Participant joined:', event)
          setParticipantCount(prev => prev + 1)
          onParticipantJoined?.(event)
        })

        apiRef.current.addEventListener('participantLeft', (event: any) => {
          console.log('Participant left:', event)
          setParticipantCount(prev => Math.max(0, prev - 1))
          onParticipantLeft?.(event)
        })

        apiRef.current.addEventListener('readyToClose', () => {
          console.log('Ready to close')
          onLeave?.()
        })

        apiRef.current.addEventListener('errorOccurred', (event: any) => {
          console.error('Jitsi error:', event)
          setError(event.error?.message || 'An error occurred with the video conference')
        })

        // Get initial participant count
        setTimeout(() => {
          try {
            const participants = apiRef.current?.getParticipantsInfo() || []
            setParticipantCount(participants.length)
          } catch (e) {
            console.warn('Could not get initial participant count')
          }
        }, 2000)

      } catch (error) {
        console.error('Failed to initialize Jitsi:', error)
        setError('Failed to load video conference. Please try again.')
        setIsLoading(false)
      }
    }

    initializeJitsi()

    // Cleanup
    return () => {
      if (apiRef.current) {
        try {
          apiRef.current.dispose()
        } catch (error) {
          console.warn('Error disposing Jitsi API:', error)
        }
      }
    }
  }, [roomName, meetingId, userName])

  const toggleAudio = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleAudio')
    }
  }

  const toggleVideo = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleVideo')
    }
  }

  const hangUp = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('hangup')
    }
  }

  const getParticipants = () => {
    if (apiRef.current) {
      try {
        return apiRef.current.getParticipantsInfo()
      } catch (error) {
        console.warn('Could not get participants:', error)
        return []
      }
    }
    return []
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-card border border-destructive rounded-lg">
        <div className="text-center p-8">
          <div className="text-destructive text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Conference Error</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-card rounded-lg overflow-hidden border border-border">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/90 z-10">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading video conference...</p>
          </div>
        </div>
      )}
      
      {/* Meeting Info Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between bg-background/80 backdrop-blur rounded-lg p-3 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Live Meeting</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {participantCount} participant{participantCount !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAudio}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            title="Toggle microphone"
          >
            🎤
          </button>
          <button
            onClick={toggleVideo}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            title="Toggle camera"
          >
            📹
          </button>
          <button
            onClick={hangUp}
            className="p-2 hover:bg-destructive hover:text-destructive-foreground rounded-lg transition-colors"
            title="Leave meeting"
          >
            📞
          </button>
        </div>
      </div>

      {/* Jitsi Container */}
      <div 
        ref={jitsiRef} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
    </div>
  )
}
