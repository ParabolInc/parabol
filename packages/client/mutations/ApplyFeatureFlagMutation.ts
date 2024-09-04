import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {ApplyFeatureFlagMutation as TApplyFeatureFlagMutation} from '../__generated__/ApplyFeatureFlagMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

// featureFlag {
//   id
//   featureName
//   scope
//   description
//   expiresAt
// }
graphql`
  fragment ApplyFeatureFlagMutation_notificatiion on ApplyFeatureFlagSuccess {
    users {
      id
      email
    }
    teams {
      id
      name
    }
    organizations {
      id
      name
    }
  }
`

const mutation = graphql`
  mutation ApplyFeatureFlagMutation($flagName: String!, $subjects: SubjectsInput!) {
    applyFeatureFlag(flagName: $flagName, subjects: $subjects) {
      ... on ErrorPayload {
        error {
          message
        }
      }
    }
  }
  ...ApplyFeatureFlagMutation_notificatiion @relay(mask: false)
`

const ApplyFeatureFlagMutation: StandardMutation<TApplyFeatureFlagMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TApplyFeatureFlagMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default ApplyFeatureFlagMutation
