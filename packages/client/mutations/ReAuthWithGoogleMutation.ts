import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {ReAuthWithGoogleMutation as TReAuthWithGoogleMutation} from '../__generated__/ReAuthWithGoogleMutation.graphql'
import type Atmosphere from '../Atmosphere'
import getMutationError from '../utils/relay/getMutationError'

const mutation = graphql`
  mutation ReAuthWithGoogleMutation($code: ID!, $pseudoId: ID, $params: String!) {
    loginWithGoogle(code: $code, pseudoId: $pseudoId, invitationToken: "", params: $params) {
      userErrors {
        message
      }
      userId
    }
  }
`

const ReAuthWithGoogleMutation = (
  atmosphere: Atmosphere,
  variables: {code: string; pseudoId?: string; params: string},
  onCompleted: (error?: string) => void
) => {
  return commitMutation<TReAuthWithGoogleMutation>(atmosphere, {
    mutation,
    variables,
    onError: (err) => onCompleted(getMutationError(err).message),
    onCompleted: (res) => {
      const [userError] = res.loginWithGoogle.userErrors
      onCompleted(userError?.message)
    }
  })
}

export default ReAuthWithGoogleMutation
