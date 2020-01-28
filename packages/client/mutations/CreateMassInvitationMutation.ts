import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {CreateMassInvitationMutation as TCreateMassInvitationMutation} from '../__generated__/CreateMassInvitationMutation.graphql'

graphql`
  fragment CreateMassInvitationMutation_team on CreateMassInvitationSuccess {
    team {
      massInvitation {
        id
        expiration
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
      ...CreateMassInvitationMutation_team @relay(mask: false)
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
