import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
// import {ToggleFeatureFlagMutation as TToggleFeatureFlagMutation} from '../__generated__/ToggleFeatureFlagMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment ToggleFeatureFlagMutation_featureFlag on ToggleFeatureFlagSuccess {
    ownerId
    enabled
  }
`

const mutation = graphql`
  mutation ToggleFeatureFlagMutation($featureName: String!, $orgId: ID, $teamId: ID, $userId: ID) {
    toggleFeatureFlag(featureName: $featureName, orgId: $orgId, teamId: $teamId, userId: $userId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...ToggleFeatureFlagMutation_featureFlag @relay(mask: false)
    }
  }
`

const ToggleFeatureFlagMutation: StandardMutation<any> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<any>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {featureName, orgId, teamId, userId} = variables
      const ownerId = orgId || teamId || userId
      if (!ownerId) return

      const owner = store.get(ownerId)
      if (!owner) return

      const featureFlags = owner.getLinkedRecords('orgFeatureFlags')
      if (!featureFlags) return

      const featureFlag = featureFlags.find(
        (flag) => flag && flag.getValue('featureName') === featureName
      )
      if (!featureFlag) return

      const currentEnabled = featureFlag.getValue('enabled')
      featureFlag.setValue(!currentEnabled, 'enabled')
    },
    onCompleted,
    onError
  })
}

export default ToggleFeatureFlagMutation
