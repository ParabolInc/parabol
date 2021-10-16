import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {AddIntegrationProviderMutation as TAddIntegrationProviderMutation} from '../__generated__/AddIntegrationProviderMutation.graphql'

graphql`
  fragment AddIntegrationProviderMutation_team on AddIntegrationProviderSuccess {
    user {
      ...MattermostProviderRow_viewer @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation AddIntegrationProviderMutation(
    $provider: AddIntegrationProviderInput!
    $token: IntegrationTokenInput
    $teamId: ID
  ) {
    addIntegrationProvider(provider: $provider, token: $token) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...AddIntegrationProviderMutation_team @relay(mask: false)
    }
  }
`

const AddIntegrationProviderMutation: StandardMutation<TAddIntegrationProviderMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TAddIntegrationProviderMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default AddIntegrationProviderMutation
