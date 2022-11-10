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
      }
    `,
    meetingRef
  )
  useInitialSafeRoute(setSafeRoute, meeting)
  useUpdatedSafeRoute(setSafeRoute, meeting)
  return safeRoute
}

export default useMeetingLocalState
