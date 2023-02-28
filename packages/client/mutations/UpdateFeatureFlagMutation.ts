import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {UpdateFeatureFlagMutation as TUpdateFeatureFlagMutation} from '../__generated__/UpdateFeatureFlagMutation.graphql'

graphql`
  fragment UpdateFeatureFlagMutation_notification on UpdateFeatureFlagPayload {
    user {
      id
      # add flag here
    }
  }
`

const mutation = graphql`
  mutation UpdateFeatureFlagMutation(
    $emails: [String!]
    $domain: String
    $flag: UserFlagEnum!
    $addFlag: Boolean!
  ) {
    updateFeatureFlag(emails: $emails, domain: $domain, flag: $flag, addFlag: $addFlag) {
      ...UpdateFeatureFlagMutation_notification @relay(mask: false)
    }
  }
`

const UpdateFeatureFlagMutation: StandardMutation<TUpdateFeatureFlagMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUpdateFeatureFlagMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default UpdateFeatureFlagMutation
