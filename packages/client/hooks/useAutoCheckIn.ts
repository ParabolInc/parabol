import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {readInlineData} from 'relay-runtime'
import {useAutoCheckIn_meeting} from '~/__generated__/useAutoCheckIn_meeting.graphql'
import JoinMeetingMutation from '../mutations/JoinMeetingMutation'
import useAtmosphere from './useAtmosphere'

const useAutoCheckIn = (meetingRef: any) => {
  const atmosphere = useAtmosphere()
  useEffect(() => {
    const meeting = readInlineData<useAutoCheckIn_meeting>(
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
    console.log('vi', viewerMeetingMember)
    if (endedAt || viewerMeetingMember) return
    JoinMeetingMutation(atmosphere, {meetingId})
  }, [])
}

export default useAutoCheckIn
