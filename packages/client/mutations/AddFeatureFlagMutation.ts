import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {AddFeatureFlagMutation as TAddFeatureFlagMutation} from '../__generated__/AddFeatureFlagMutation.graphql'

graphql`
  fragment AddFeatureFlagMutation_notification on AddFeatureFlagPayload {
    user {
      id
      # add flag here
    }
  }
`

const mutation = graphql`
  mutation AddFeatureFlagMutation($emails: [String!], $domain: String, $flag: UserFlagEnum!) {
    addFeatureFlag(emails: $emails, domain: $domain, flag: $flag) {
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
