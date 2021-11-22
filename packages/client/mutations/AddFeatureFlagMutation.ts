import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {StandardMutation} from '../types/relayMutations'
import {AddFeatureFlagMutation as TAddFeatureFlagMutation} from '../__generated__/AddFeatureFlagMutation.graphql'

graphql`
  fragment AddFeatureFlagMutation_notification on AddFeatureFlagPayload {
    user {
      featureFlags {
        jira
        poker
        spotlight
      }
    }
  }
`

const mutation = graphql`
  mutation AddFeatureFlagMutation($emails: [String!], $domain: String, $flag: UserFlagEnum!) {
    addFeatureFlag(emails: $emails, domain: $domain, flag: $flag) {
      error {
        message
      }
      ...AddFeatureFlagMutation_notification @relay(mask: false)
    }
  }
`

const AddFeatureFlagMutation: StandardMutation<TAddFeatureFlagMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TAddFeatureFlagMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default AddFeatureFlagMutation
