import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {UpdateIntegrationProviderMutation as TUpdateIntegrationProviderMutation} from '../__generated__/UpdateIntegrationProviderMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment UpdateIntegrationProviderMutation_organization on UpdateIntegrationProviderSuccess {
    provider {
      id
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
  mutation UpdateIntegrationProviderMutation($provider: UpdateIntegrationProviderInput!) {
    updateIntegrationProvider(provider: $provider) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateIntegrationProviderMutation_organization @relay(mask: false)
    }
  }
`

const UpdateIntegrationProviderMutation: StandardMutation<TUpdateIntegrationProviderMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUpdateIntegrationProviderMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default UpdateIntegrationProviderMutation
