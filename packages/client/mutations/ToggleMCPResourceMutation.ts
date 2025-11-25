import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {ToggleMCPResourceMutation as TToggleMCPResourceMutation} from '../__generated__/ToggleMCPResourceMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment ToggleMCPResourceMutation_organization on ToggleMCPResourceSuccess {
    organization {
      id
      mcpResources
    }
  }
`

const mutation = graphql`
  mutation ToggleMCPResourceMutation($orgId: ID!, $resource: String!, $enabled: Boolean!) {
    toggleMCPResource(orgId: $orgId, resource: $resource, enabled: $enabled) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...ToggleMCPResourceMutation_organization @relay(mask: false)
    }
  }
`

const ToggleMCPResourceMutation: StandardMutation<TToggleMCPResourceMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TToggleMCPResourceMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const org = store.get(variables.orgId)
      if (!org) return

      const mcpResourcesStr = org.getValue('mcpResources') as string | null
      const mcpResources = mcpResourcesStr
        ? JSON.parse(mcpResourcesStr)
        : {organizations: false, teams: false, pages: false}

      mcpResources[variables.resource] = variables.enabled
      org.setValue(JSON.stringify(mcpResources), 'mcpResources')
    },
    onCompleted,
    onError
  })
}

export default ToggleMCPResourceMutation
