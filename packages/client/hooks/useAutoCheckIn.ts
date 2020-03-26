import useAtmosphere from './useAtmosphere'
import {readInlineData} from 'relay-runtime'
import {useEffect} from 'react'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import NewMeetingCheckInMutation from '../mutations/NewMeetingCheckInMutation'
import graphql from 'babel-plugin-relay/macro'
import {useAutoCheckIn_meeting} from '__generated__/useAutoCheckIn_meeting.graphql'

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
