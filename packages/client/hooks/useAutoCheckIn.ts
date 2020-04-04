import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {readInlineData} from 'relay-runtime'
import {useAutoCheckIn_meeting} from '__generated__/useAutoCheckIn_meeting.graphql'
import NewMeetingCheckInMutation from '../mutations/NewMeetingCheckInMutation'
import useAtmosphere from './useAtmosphere'

const useAutoCheckIn = (meetingRef: any) => {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  useEffect(() => {
    const meeting = readInlineData<useAutoCheckIn_meeting>(
      graphql`
        fragment useAutoCheckIn_meeting on NewMeeting @inline {
          id
          viewerMeetingMember {
            isCheckedIn
          }
        }
      `,
      meetingRef
    )
    const {id: meetingId, viewerMeetingMember} = meeting
    const {isCheckedIn} = viewerMeetingMember
    if (!isCheckedIn) {
      NewMeetingCheckInMutation(atmosphere, {meetingId, userId: viewerId, isCheckedIn: true})
    }
  }, [])
}

export default useAutoCheckIn
