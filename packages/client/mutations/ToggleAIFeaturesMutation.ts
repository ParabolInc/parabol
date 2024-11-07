import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {ToggleAIFeaturesMutation as TToggleAIFeaturesMutation} from '../__generated__/ToggleAIFeaturesMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment ToggleAIFeaturesMutation_organization on ToggleAIFeaturesSuccess {
    organization {
      id
      useAI
    }
  }
`

const mutation = graphql`
  mutation ToggleAIFeaturesMutation($orgId: ID!) {
    toggleAIFeatures(orgId: $orgId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...ToggleAIFeaturesMutation_organization @relay(mask: false)
    }
  }
`

const ToggleAIFeaturesMutation: StandardMutation<TToggleAIFeaturesMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TToggleAIFeaturesMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default ToggleAIFeaturesMutation
