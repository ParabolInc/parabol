import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {CreateMassInvitationMutation as TCreateMassInvitationMutation} from '../__generated__/CreateMassInvitationMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment CreateMassInvitationMutation_team on CreateMassInvitationSuccess
  @argumentDefinitions(meetingId: {type: "ID", defaultValue: null}) {
    team {
      massInvitation(meetingId: $meetingId) {
        id
        expiration
        meetingId
      }
    }
  }
`

const mutation = graphql`
  mutation CreateMassInvitationMutation($meetingId: ID, $teamId: ID!, $voidOld: Boolean) {
    createMassInvitation(meetingId: $meetingId, teamId: $teamId, voidOld: $voidOld) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...CreateMassInvitationMutation_team @arguments(meetingId: $meetingId)
    }
  }
`

const CreateMassInvitationMutation: StandardMutation<TCreateMassInvitationMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TCreateMassInvitationMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default CreateMassInvitationMutation
