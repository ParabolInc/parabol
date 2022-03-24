import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {RemoveAzureDevOpsAuthMutation as TRemoveAzureDevOpsAuthMutation} from '../__generated__/RemoveAzureDevOpsAuthMutation.graphql'

graphql`
  fragment RemoveAzureDevOpsAuthMutation_part on RemoveAzureDevOpsAuthSuccess {
    teamMember {
      integrations {
        azureDevOps {
          ...AzureDevOpsProviderRowAzureDevOpsIntegration @relay(mask: false)
        }
      }
    }
  }
`

const mutation = graphql`
  mutation RemoveAzureDevOpsAuthMutation($teamId: ID!) {
    removeAzureDevOpsAuth(teamId: $teamId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...RemoveAzureDevOpsAuthMutation_part @relay(mask: false)
    }
  }
`

const RemoveAzureDevOpsAuthMutation: StandardMutation<TRemoveAzureDevOpsAuthMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TRemoveAzureDevOpsAuthMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default RemoveAzureDevOpsAuthMutation
