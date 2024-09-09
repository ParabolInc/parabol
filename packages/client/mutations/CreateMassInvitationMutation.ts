import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {CreateMassInvitationMutation as TCreateMassInvitationMutation} from '../__generated__/CreateMassInvitationMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment CreateMassInvitationMutation_team on CreateMassInvitationSuccess {
    team {
      massInvitation {
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
    updater: (store) => {
      const payload = store.getRootField('createMassInvitation')
      if (!payload) return
      const team = payload.getLinkedRecord('team')
      const massInvitation = team.getLinkedRecord('massInvitation')
      const meetingId = massInvitation.getValue('meetingId')
      if (!meetingId) return
      // satisfy the need of the query
      team.setLinkedRecord(massInvitation, 'massInvitation', {meetingId})
    },
    variables,
    onCompleted,
    onError
  })
}

export default CreateMassInvitationMutation
