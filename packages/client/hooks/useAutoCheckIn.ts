import graphql from 'babel-plugin-relay/macro'
import {useEffect, useRef} from 'react'
import {readInlineData} from 'relay-runtime'
import {useAutoCheckIn_meeting$key} from '~/__generated__/useAutoCheckIn_meeting.graphql'
import JoinMeetingMutation from '../mutations/JoinMeetingMutation'
import MeetingSubscription from '../subscriptions/MeetingSubscription'
import useAtmosphere from './useAtmosphere'
import useRouter from './useRouter'

const useAutoCheckIn = (meetingRef: useAutoCheckIn_meeting$key) => {
  const atmosphere = useAtmosphere()
  const {history, location} = useRouter()
  const router = {history, location}
  const queryKey = 'useAutoCheckIn'
  const hasCalledJoinedRef = useRef(false)
  useEffect(() => {
    const meeting = readInlineData(
      graphql`
        fragment useAutoCheckIn_meeting on NewMeeting @inline {
          id
          endedAt
          viewerMeetingMember {
            id
          }
        }
      `,
      meetingRef
    )
    const {id: meetingId, endedAt, viewerMeetingMember} = meeting
    const subscribeToMeeting = () => {
      if (atmosphere.registerQuery) {
        atmosphere.registerQuery(queryKey, MeetingSubscription, {meetingId}, router).catch(() => {
          /*ignore*/
        })
      }
    }
    if (viewerMeetingMember) {
      subscribeToMeeting()
    } else if (!endedAt && !hasCalledJoinedRef.current) {
      hasCalledJoinedRef.current = true
      JoinMeetingMutation(
        atmosphere,
        {meetingId},
        {onCompleted: subscribeToMeeting, onError: () => undefined}
      )
    }
    return () => {
      if (atmosphere.scheduleUnregisterQuery) {
        atmosphere.scheduleUnregisterQuery(queryKey, 300000)
      }
    }
  }, [])
}

export default useAutoCheckIn
