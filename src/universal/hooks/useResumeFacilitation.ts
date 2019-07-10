import {graphql} from 'react-relay'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import {useEffect} from 'react'
import PromoteNewMeetingFacilitatorMutation from 'universal/mutations/PromoteNewMeetingFacilitatorMutation'
import {useResumeFacilitationTeam} from '__generated__/useResumeFacilitationTeam.graphql'

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
  const {viewerId} = atmosphere
  useEffect(() => {
    if (!team) return
    const {newMeeting} = team
    if (!newMeeting) return
    const {id: meetingId, defaultFacilitatorUserId, facilitatorUserId} = newMeeting
    if (defaultFacilitatorUserId === viewerId && facilitatorUserId !== viewerId) {
      PromoteNewMeetingFacilitatorMutation(atmosphere, {facilitatorUserId: viewerId, meetingId})
    }
  }, [team])
}

export default useResumeFacilitation
