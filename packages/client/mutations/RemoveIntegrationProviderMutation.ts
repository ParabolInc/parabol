import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {RemoveIntegrationProviderMutation as TRemoveIntegrationProviderMutation} from '../__generated__/RemoveIntegrationProviderMutation.graphql'

graphql`
  fragment RemoveIntegrationProviderMutation_team on RemoveIntegrationProviderSuccess {
    user {
      ...MattermostProviderRow_viewer @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation RemoveIntegrationProviderMutation($providerId: ID!, $teamId: ID!) {
    removeIntegrationProvider(providerId: $providerId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...RemoveIntegrationProviderMutation_team @relay(mask: false)
    }
  }
`

const RemoveIntegrationProviderMutation: StandardMutation<TRemoveIntegrationProviderMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TRemoveIntegrationProviderMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default RemoveIntegrationProviderMutation
