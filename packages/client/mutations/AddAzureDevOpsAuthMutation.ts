import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {AddAzureDevOpsAuthMutation as TAddAzureDevOpsAuthMutation} from '../__generated__/AddAzureDevOpsAuthMutation.graphql'

graphql`
  fragment AddAzureDevOpsAuthMutation_team on AddAzureDevOpsAuthSuccess {
    teamId
  }
`

const mutation = graphql`
  mutation AddAzureDevOpsAuthMutation($code: ID!, $verifier: ID!, $teamId: ID!) {
    addAzureDevOpsAuth(code: $code, verifier: $verifier, teamId: $teamId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...AddAzureDevOpsAuthMutation_team @relay(mask: false)
    }
  }
`

const AddAzureDevOpsAuthMutation: StandardMutation<TAddAzureDevOpsAuthMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TAddAzureDevOpsAuthMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default AddAzureDevOpsAuthMutation
