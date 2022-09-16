import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {Disposable} from 'relay-runtime'
import {LocalHandlers, OnNextHandler} from '../types/relayMutations'
import {
  DenyPushInvitationMutation as TDenyPushInvitationMutation,
  DenyPushInvitationMutationVariables
} from '../__generated__/DenyPushInvitationMutation.graphql'
import {DenyPushInvitationMutation_team} from '../__generated__/DenyPushInvitationMutation_team.graphql'

graphql`
  fragment DenyPushInvitationMutation_team on DenyPushInvitationPayload {
    teamId
    userId
  }
`

const mutation = graphql`
  mutation DenyPushInvitationMutation($teamId: ID!, $userId: ID!) {
    denyPushInvitation(teamId: $teamId, userId: $userId) {
      error {
        message
        title
      }
      ...DenyPushInvitationMutation_team @relay(mask: false)
    }
  }
`

export const denyPushInvitationTeamOnNext: OnNextHandler<DenyPushInvitationMutation_team> = (
  payload,
  {atmosphere}
) => {
  const {userId, teamId} = payload
  if (!userId || !teamId) return
  atmosphere.eventEmitter.emit(
    'removeSnackbar',
    (snack) => snack.key === `pushInvitation:${teamId}:${userId}`
  )
}

const DenyPushInvitationMutation = (
  atmosphere,
  variables: DenyPushInvitationMutationVariables,
  {onError}: LocalHandlers = {}
): Disposable => {
  return commitMutation<TDenyPushInvitationMutation>(atmosphere, {
    mutation,
    variables,
    onError
  })
}

export default DenyPushInvitationMutation
