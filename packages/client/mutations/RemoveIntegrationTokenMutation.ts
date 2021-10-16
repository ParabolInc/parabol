import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {RemoveIntegrationTokenMutation as TRemoveIntegrationTokenMutation} from '../__generated__/RemoveIntegrationTokenMutation.graphql'

graphql`
  fragment RemoveIntegrationTokenMutation_team on RemoveIntegrationTokenSuccess {
    user {
      ...GitLabProviderRow_viewer @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation RemoveIntegrationTokenMutation($providerId: ID!, $teamId: ID!) {
    removeIntegrationToken(providerId: $providerId, teamId: $teamId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...RemoveIntegrationTokenMutation_team @relay(mask: false)
    }
  }
`

const RemoveIntegrationTokenMutation: StandardMutation<TRemoveIntegrationTokenMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TRemoveIntegrationTokenMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default RemoveIntegrationTokenMutation
