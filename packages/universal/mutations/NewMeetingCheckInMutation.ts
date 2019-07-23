import {NewMeetingCheckInMutation as TNewMeetingCheckInMutation} from '__generated__/NewMeetingCheckInMutation.graphql'
import {commitMutation, graphql} from 'react-relay'
import Atmosphere from 'universal/Atmosphere'
import {INewMeetingCheckInOnMutationArguments} from 'universal/types/graphql'
import {LocalHandlers} from 'universal/types/relayMutations'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'

graphql`
  fragment NewMeetingCheckInMutation_team on NewMeetingCheckInPayload {
    meeting {
      ... on RetrospectiveMeeting {
        votesRemaining
      }
    }
    meetingMember {
      isCheckedIn
    }
  }
`

const mutation = graphql`
  mutation NewMeetingCheckInMutation($meetingId: ID!, $userId: ID!, $isCheckedIn: Boolean) {
    newMeetingCheckIn(meetingId: $meetingId, userId: $userId, isCheckedIn: $isCheckedIn) {
      error {
        message
      }
      ...NewMeetingCheckInMutation_team @relay(mask: false)
    }
  }
`

const NewMeetingCheckInMutation = (
  atmosphere: Atmosphere,
  variables: INewMeetingCheckInOnMutationArguments,
  {onError, onCompleted}: LocalHandlers = {}
) => {
  return commitMutation<TNewMeetingCheckInMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {meetingId, userId, isCheckedIn} = variables
      const meetingMemberId = toTeamMemberId(meetingId, userId)
      const meetingMember = store.get(meetingMemberId)!
      meetingMember.setValue(isCheckedIn, 'isCheckedIn')
    },
    onCompleted,
    onError
  })
}

export default NewMeetingCheckInMutation
