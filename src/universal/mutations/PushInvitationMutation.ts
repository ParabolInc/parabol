import {commitMutation, graphql} from 'react-relay'
import {Disposable} from 'relay-runtime'
import {LocalHandlers, OnNextHandler} from '../types/relayMutations'
import {
  PushInvitationMutation as TPushInvitationMutation,
  PushInvitationMutationVariables
} from '__generated__/PushInvitationMutation.graphql'
import {PushInvitationMutation_team} from '__generated__/PushInvitationMutation_team.graphql'

graphql`
  fragment PushInvitationMutation_team on PushInvitationPayload {
    user {
      preferredName
      email
    }
  }
`

const mutation = graphql`
  mutation PushInvitationMutation($teamId: ID!) {
    pushInvitation(teamId: $teamId) {
      error {
        message
        title
      }
    }
  }
`

export const pushInvitationTeamOnNext: OnNextHandler<PushInvitationMutation_team> = (
  payload,
  {atmosphere}
) => {
  const {user} = payload
  if (!user) return
  const {preferredName, email} = user
  // const deny = () => {
  console.log(preferredName, email, atmosphere)
  // }
  // TODO toast with an accept/deny
}

const PushInvitationMutation = (
  atmosphere,
  variables: PushInvitationMutationVariables,
  {onError}: LocalHandlers = {}
): Disposable => {
  return commitMutation<TPushInvitationMutation>(atmosphere, {
    mutation,
    variables,
    onError
  })
}

export default PushInvitationMutation
