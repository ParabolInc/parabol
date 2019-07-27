import graphql from 'babel-plugin-relay/macro'
import useAtmosphere from './useAtmosphere'
import {useEffect} from 'react'
import PromoteNewMeetingFacilitatorMutation from '../mutations/PromoteNewMeetingFacilitatorMutation'
import {useResumeFacilitationTeam} from '../__generated__/useResumeFacilitationTeam.graphql'

graphql`
  fragment useResumeFacilitationTeam on Team {
    newMeeting {
      id
      facilitatorUserId
      defaultFacilitatorUserId
    }
  }
`
const useResumeFacilitation = (team: useResumeFacilitationTeam | null) => {
  const atmosphere = useAtmosphere()
  useEffect(() => {
    const {viewerId} = atmosphere
    if (!team) return
    const {newMeeting} = team
    if (!newMeeting) return
    const {id: meetingId, defaultFacilitatorUserId, facilitatorUserId} = newMeeting
    if (defaultFacilitatorUserId === viewerId && facilitatorUserId !== viewerId) {
      PromoteNewMeetingFacilitatorMutation(atmosphere, {facilitatorUserId: viewerId, meetingId})
    }
  }, [atmosphere, team])
}

export default useResumeFacilitation
