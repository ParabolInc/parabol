import graphql from 'babel-plugin-relay/macro'
import {useEffect, useState} from 'react'
import {readInlineData} from 'relay-runtime'
import getMissingMeetingPhaseError from '../utils/meetings/getMissingMeetingPhaseError'
import useInitialSafeRoute from './useInitialSafeRoute'
import useUpdatedSafeRoute from './useUpdatedSafeRoute'

// Relay delivers a local phase it missed a render later, so one still missing after this isn't coming
const LOCAL_PHASE_TIMEOUT_MS = 5000

const useMeetingLocalState = (meetingRef: any) => {
  const [safeRoute, setSafeRoute] = useState(false)
  const [isLocalPhaseOverdue, setIsLocalPhaseOverdue] = useState(false)
  const meeting = readInlineData(
    graphql`
      fragment useMeetingLocalState_meeting on NewMeeting @inline {
        ...useInitialSafeRoute_meeting
        ...useUpdatedSafeRoute_meeting
        ...getMissingMeetingPhaseError_meeting
        localPhase {
          id
        }
      }
    `,
    meetingRef
  )
  useInitialSafeRoute(setSafeRoute, meeting)
  useUpdatedSafeRoute(setSafeRoute, meeting)
  // If the store changed before the effects that set the local phase ran, Relay delivers that phase a render later
  const isAwaitingLocalPhase = safeRoute && !meeting.localPhase
  useEffect(() => {
    if (!isAwaitingLocalPhase) return
    const timeoutId = setTimeout(() => setIsLocalPhaseOverdue(true), LOCAL_PHASE_TIMEOUT_MS)
    return () => clearTimeout(timeoutId)
  }, [isAwaitingLocalPhase])
  // the error boundary reports it and tells the viewer to refresh, instead of leaving them a blank meeting
  if (isAwaitingLocalPhase && isLocalPhaseOverdue) throw getMissingMeetingPhaseError(meeting)
  return safeRoute && !!meeting.localPhase
}

export default useMeetingLocalState
