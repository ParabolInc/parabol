import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {readInlineData} from 'relay-runtime'
import useInitialSafeRoute from './useInitialSafeRoute'
import useUpdatedSafeRoute from './useUpdatedSafeRoute'

const useMeetingLocalState = (meetingRef: any) => {
  const [safeRoute, setSafeRoute] = useState(false)
  const meeting = readInlineData(
    graphql`
      fragment useMeetingLocalState_meeting on NewMeeting @inline {
        ...useInitialSafeRoute_meeting
        ...useUpdatedSafeRoute_meeting
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
  return safeRoute && !!meeting.localPhase
}

export default useMeetingLocalState
