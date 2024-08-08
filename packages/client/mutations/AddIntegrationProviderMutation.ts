import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {AddIntegrationProviderMutation as TAddIntegrationProviderMutation} from '../__generated__/AddIntegrationProviderMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment AddIntegrationProviderMutation_organization on AddIntegrationProviderSuccess {
    provider {
      id
      teamId
      orgId
      ... on IntegrationProviderWebhook {
        webhookUrl
      }
      ... on IntegrationProviderOAuth2 {
        serverBaseUrl
        clientId
        tenantId
      }
    }
  }
`

const mutation = graphql`
  mutation AddIntegrationProviderMutation($input: AddIntegrationProviderInput!) {
    addIntegrationProvider(input: $input) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...AddIntegrationProviderMutation_organization @relay(mask: false)
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
