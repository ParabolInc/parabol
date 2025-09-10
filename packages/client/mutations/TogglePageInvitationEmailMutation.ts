import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {TogglePageInvitationEmailMutation as TTogglePageInvitationEmailMutation} from '../__generated__/TogglePageInvitationEmailMutation.graphql'
import type {StandardMutation} from '../types/relayMutations'

graphql`
  fragment TogglePageInvitationEmailMutation_team on TogglePageInvitationEmailSuccess {
    user {
      sendPageInvitationEmail
    }
  }
`

const mutation = graphql`
  mutation TogglePageInvitationEmailMutation {
    togglePageInvitationEmail {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...TogglePageInvitationEmailMutation_team @relay(mask: false)
    }
  }
`

const TogglePageInvitationEmailMutation: StandardMutation<TTogglePageInvitationEmailMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TTogglePageInvitationEmailMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default TogglePageInvitationEmailMutation
