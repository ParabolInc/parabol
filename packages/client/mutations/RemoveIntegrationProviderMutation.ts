import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {RemoveIntegrationProviderMutation as TRemoveIntegrationProviderMutation} from '../__generated__/RemoveIntegrationProviderMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment RemoveIntegrationProviderMutation_organization on RemoveIntegrationProviderSuccess {
    teamMemberIntegrations {
      ...MattermostProviderRowTeamMemberIntegrations @relay(mask: false)
      ...MSTeamsProviderRowTeamMemberIntegrations @relay(mask: false)
    }
    orgIntegrationProviders {
      ...GitLabProviders_orgIntegrationProviders @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation RemoveIntegrationProviderMutation($providerId: ID!) {
    removeIntegrationProvider(providerId: $providerId) {
      ...RemoveIntegrationProviderMutation_organization
      ... on ErrorPayload {
        error {
          message
        }
      }
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
