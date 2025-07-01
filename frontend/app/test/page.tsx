'use client'

import JitsiEmbed from '@/components/JitsiEmbed'
import { useState } from 'react'

export default function TestMeetingPage() {
  const [isJoining, setIsJoining] = useState(false)
  const [userName] = useState('TestUser')
  const [testScenario, setTestScenario] = useState('safe')

  const handleJoin = (scenario: string) => {
    setTestScenario(scenario)
    setIsJoining(true)
  }

  const getRoomName = () => {
    switch (testScenario) {
      case 'problematic':
        return 'ai-meeting-conference-room-test' // Potentially problematic name
      case 'short':
        return 'ai' // Very short name that might cause issues
      case 'reserved':
        return 'meeting-admin-test' // Name that might be reserved
      default:
        return 'simple123' // Safe name
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Jitsi Test Page</h1>
        
        {!isJoining ? (
          <div className="text-center space-y-4">
            <p className="mb-4">Test different Jitsi room scenarios:</p>
            <div className="flex flex-col gap-3 items-center">
              <button
                onClick={() => handleJoin('safe')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Join Safe Room (simple123)
              </button>
              <button
                onClick={() => handleJoin('problematic')}
                className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Join Problematic Room (ai-meeting-conference-room-test)
              </button>
              <button
                onClick={() => handleJoin('short')}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Join Short Name Room (ai)
              </button>
              <button
                onClick={() => handleJoin('reserved')}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Join Reserved Name Room (meeting-admin-test)
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              These test different room naming scenarios to verify error handling and retry logic.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Testing: {testScenario} scenario</h2>
              <button
                onClick={() => setIsJoining(false)}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
              >
                Back to Tests
              </button>
            </div>
            <div className="h-[600px] w-full border border-border rounded-lg">
              <JitsiEmbed
                roomName={getRoomName()}
                meetingId={`test-${testScenario}-${Date.now()}`}
                userName={userName}
                onJoin={() => console.log(`Joined ${testScenario} test meeting`)}
                onLeave={() => setIsJoining(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
