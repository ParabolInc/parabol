import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {AddADOAuthMutation as TAddADOAuthMutation} from '../__generated__/AddADOAuthMutation.graphql'

graphql`
  fragment AddADOAuthMutation_team on AddADOAuthSuccess {
    teamId
  }
`

const mutation = graphql`
  mutation AddADOAuthMutation($code: ID!, $verifier: ID!, $teamId: ID!) {
    addADOAuth(code: $code, verifier: $verifier, teamId: $teamId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...AddADOAuthMutation_team @relay(mask: false)
    }
  }
`

const AddADOAuthMutation: StandardMutation<TAddADOAuthMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TAddADOAuthMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default AddADOAuthMutation
