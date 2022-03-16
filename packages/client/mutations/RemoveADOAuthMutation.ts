import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {RemoveADOAuthMutation as TRemoveADOAuthMutation} from '../__generated__/RemoveADOAuthMutation.graphql'

graphql`
  fragment RemoveADOAuthMutation_part on RemoveADOAuthSuccess {
    teamMember {
      integrations {
        ado {
          ...ADOProviderRowADOIntegration @relay(mask: false)
        }
      }
    }
  }
`

const mutation = graphql`
  mutation RemoveADOAuthMutation($teamId: ID!) {
    removeADOAuth(teamId: $teamId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...RemoveADOAuthMutation_part @relay(mask: false)
    }
  }
`

const RemoveADOAuthMutation: StandardMutation<TRemoveADOAuthMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TRemoveADOAuthMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default RemoveADOAuthMutation
