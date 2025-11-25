import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {ToggleMCPEnabledMutation as TToggleMCPEnabledMutation} from '../__generated__/ToggleMCPEnabledMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment ToggleMCPEnabledMutation_organization on ToggleMCPEnabledSuccess {
    organization {
      id
      mcpEnabled
    }
  }
`

const mutation = graphql`
  mutation ToggleMCPEnabledMutation($orgId: ID!, $enabled: Boolean!) {
    toggleMCPEnabled(orgId: $orgId, enabled: $enabled) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...ToggleMCPEnabledMutation_organization @relay(mask: false)
    }
  }
`

const ToggleMCPEnabledMutation: StandardMutation<TToggleMCPEnabledMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TToggleMCPEnabledMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const org = store.get(variables.orgId)
      if (!org) return
      org.setValue(variables.enabled, 'mcpEnabled')
    },
    onCompleted,
    onError
  })
}

export default ToggleMCPEnabledMutation
