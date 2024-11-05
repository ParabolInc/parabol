import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {ToggleFeatureFlagMutation as TToggleFeatureFlagMutation} from '../__generated__/ToggleFeatureFlagMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment ToggleFeatureFlagMutation_notification on ToggleFeatureFlagSuccess {
    featureFlag {
      featureName
      enabled
    }
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
      ...ToggleFeatureFlagMutation_notification @relay(mask: false)
    }
  }
`

const ToggleFeatureFlagMutation: StandardMutation<TToggleFeatureFlagMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TToggleFeatureFlagMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default ToggleFeatureFlagMutation
