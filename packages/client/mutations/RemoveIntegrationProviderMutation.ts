import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {RemoveIntegrationProviderMutation as TRemoveIntegrationProviderMutation} from '../__generated__/RemoveIntegrationProviderMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

/* TODO we should update these somehow
graphql`
  fragment RemoveIntegrationProviderMutation_team on RemoveIntegrationProviderSuccess {
    teamMember {
      ...MattermostProviderRowTeamMember @relay(mask: false)
      ...GitLabProviderRowTeamMember @relay(mask: false)
      ...MSTeamsProviderRowTeamMember @relay(mask: false)
    }
  }
`
*/

const mutation = graphql`
  mutation RemoveIntegrationProviderMutation($providerId: ID!) {
    removeIntegrationProvider(providerId: $providerId) {
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
