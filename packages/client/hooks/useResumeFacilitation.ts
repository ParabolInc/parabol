import graphql from 'babel-plugin-relay/macro'
import useAtmosphere from './useAtmosphere'
import {useEffect} from 'react'
import PromoteNewMeetingFacilitatorMutation from '../mutations/PromoteNewMeetingFacilitatorMutation'
import {readInlineData} from 'relay-runtime'
import {useResumeFacilitation_meeting} from '~/__generated__/useResumeFacilitation_meeting.graphql'

const useResumeFacilitation = (meetingRef: any) => {
  const atmosphere = useAtmosphere()
  const meeting = readInlineData<useResumeFacilitation_meeting>(
    graphql`
      fragment useResumeFacilitation_meeting on NewMeeting @inline {
        id
        createdBy
        facilitatorUserId
      }
    `,
    meetingRef
  )

  useEffect(() => {
    const {viewerId} = atmosphere
    const {id: meetingId, createdBy, facilitatorUserId} = meeting
    if (createdBy === viewerId && facilitatorUserId !== viewerId) {
      PromoteNewMeetingFacilitatorMutation(atmosphere, {facilitatorUserId: viewerId, meetingId})
    }
  }, [atmosphere, meeting])
}

export default useResumeFacilitation
