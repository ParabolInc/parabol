import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {UpdateSAMLMutation as TUpdateSAMLMutation} from '../__generated__/UpdateSAMLMutation.graphql'

graphql`
  fragment UpdateSAMLMutation_part on UpdateSAMLSuccess {
    success
  }
`

const mutation = graphql`
  mutation UpdateSAMLMutation($orgId: ID!, $metadata: String) {
    updateSAML(orgId: $orgId, metadata: $metadata) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateSAMLMutation_part @relay(mask: false)
    }
  }
`

const UpdateSAMLMutation: StandardMutation<TUpdateSAMLMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUpdateSAMLMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default UpdateSAMLMutation
