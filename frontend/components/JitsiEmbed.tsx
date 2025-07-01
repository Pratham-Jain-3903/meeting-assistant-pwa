'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

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
  const [retryCount, setRetryCount] = useState(0)
  const [currentRoomName, setCurrentRoomName] = useState<string>('')

  const generateSafeRoomName = useCallback((originalName: string, attempt: number = 0) => {
    // Always create a completely safe room name to avoid conflicts with restricted rooms
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(7)
    
    // For retries, use completely random names
    if (attempt > 0) {
      return `room${timestamp}${attempt}${randomSuffix}`
    }
    
    // Always generate a safe name regardless of input to prevent any problematic patterns
    // Instead of trying to clean the original name, just use a hash/reference of it
    const baseHash = originalName ? Math.abs(originalName.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) : 0
    const safeName = `room${timestamp}${baseHash}${randomSuffix}`.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    
    // Ensure minimum length
    return safeName.length < 8 ? `room${timestamp}${randomSuffix}` : safeName
  }, [])

  const loadJitsiScript = useCallback(() => {
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
  }, [])

  // Track retry trigger to force re-initialization
  const [retryTrigger, setRetryTrigger] = useState(0)

  const retryWithNewRoom = useCallback(async () => {
    if (retryCount >= 3) {
      setError('Unable to connect after multiple attempts. Please try refreshing the page.')
      setIsLoading(false)
      return
    }

    setRetryCount((prev: number) => prev + 1)
    setError('Trying a different room...')
    
    // Wait a moment before retrying
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate new room name
    const newRoomName = generateSafeRoomName(roomName || meetingId, retryCount + 1)
    setCurrentRoomName(newRoomName)
    
    // Trigger re-initialization by updating retry trigger
    setRetryTrigger((prev: number) => prev + 1)
  }, [retryCount, roomName, meetingId, generateSafeRoomName])

  const initializeJitsi = useCallback(async (customRoomName?: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      await loadJitsiScript()
      
      if (!jitsiRef.current) return

      // Clean up any existing API instance
      if (apiRef.current) {
        try {
          apiRef.current.dispose()
        } catch (e) {
          console.warn('Error disposing previous API:', e)
        }
      }

      const domain = 'meet.jit.si'
      const safeRoomName = customRoomName || generateSafeRoomName(roomName || `meeting_${meetingId}`, retryCount)
      setCurrentRoomName(safeRoomName)
      
      const options = {
        roomName: safeRoomName,
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
          enableLobbyChat: false,
          enableInsecureRoomNameWarning: false,
          resolution: 720,
          constraints: {
            video: {
              aspectRatio: 16 / 9,
              height: {
                ideal: 720,
                max: 720,
                min: 240
              }
            }
          },
          useStunTurn: true,
          enableP2P: true,
          p2p: {
            enabled: true,
            stunServers: [
              { urls: 'stun:meet-jit-si-turnrelay.jitsi.net:443' }
            ]
          }
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'closedcaptions',
            'desktop',
            'fullscreen',
            'hangup',
            'profile',
            'chat',
            'settings',
            'raisehand',
            'videoquality',
            'filmstrip',
            'invite',
            'tileview'
          ],
          SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile'],
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

      // Setup event listeners
      apiRef.current.addEventListener('videoConferenceJoined', (event: any) => {
        console.log('Joined conference:', event)
        setIsLoading(false)
        setError(null)
        setRetryCount(0) // Reset retry count on success
        onJoin?.()
      })

      apiRef.current.addEventListener('videoConferenceLeft', (event: any) => {
        console.log('Left conference:', event)
        onLeave?.()
      })

      apiRef.current.addEventListener('participantJoined', (event: any) => {
        console.log('Participant joined:', event)
        setParticipantCount((prev: number) => prev + 1)
        onParticipantJoined?.(event)
      })

      apiRef.current.addEventListener('participantLeft', (event: any) => {
        console.log('Participant left:', event)
        setParticipantCount((prev: number) => Math.max(0, prev - 1))
        onParticipantLeft?.(event)
      })

      apiRef.current.addEventListener('readyToClose', () => {
        console.log('Ready to close')
        onLeave?.()
      })

      apiRef.current.addEventListener('errorOccurred', (event: any) => {
        console.error('Jitsi error:', event)
        
        const errorType = event.error?.message || event.error?.toString() || ''
        const isConnectionError = errorType.includes('connectionError') || 
                                errorType.includes('connection.failed') ||
                                event.type?.includes('connectionError')
        const isMembersOnlyError = errorType.includes('membersOnly') || 
                                 event.type?.includes('membersOnly')
        
        if (isMembersOnlyError) {
          console.log('Members only error detected, retrying...')
          retryWithNewRoom()
        } else if (isConnectionError) {
          console.log('Connection error detected, retrying...')
          retryWithNewRoom()
        } else {
          setError(errorType || 'An error occurred with the video conference')
          setIsLoading(false)
        }
      })

      // Get initial participant count after a delay
      setTimeout(() => {
        try {
          if (apiRef.current) {
            const participants = apiRef.current.getParticipantsInfo() || []
            setParticipantCount(participants.length)
          }
        } catch (e) {
          console.warn('Could not get initial participant count:', e)
        }
      }, 2000)

    } catch (error) {
      console.error('Failed to initialize Jitsi:', error)
      setError('Failed to load video conference. Please try again.')
      setIsLoading(false)
    }
  }, [roomName, meetingId, userName, retryCount, generateSafeRoomName, loadJitsiScript, onJoin, onLeave, onParticipantJoined, onParticipantLeft])

  useEffect(() => {
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
  }, [initializeJitsi, retryTrigger])

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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {retryCount > 0 ? 'Retrying connection...' : 'Loading video conference...'}
            </p>
            {retryCount > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Attempt {retryCount + 1} of 3
              </p>
            )}
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
          {currentRoomName && (
            <div className="text-xs text-muted-foreground font-mono">
              Room: {currentRoomName}
            </div>
          )}
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
