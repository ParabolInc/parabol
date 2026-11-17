import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {ReAuthWithMicrosoftMutation as TReAuthWithMicrosoftMutation} from '../__generated__/ReAuthWithMicrosoftMutation.graphql'
import type Atmosphere from '../Atmosphere'
import getMutationError from '../utils/relay/getMutationError'

const mutation = graphql`
  mutation ReAuthWithMicrosoftMutation($code: ID!, $pseudoId: ID, $params: String!) {
    loginWithMicrosoft(code: $code, pseudoId: $pseudoId, invitationToken: "", params: $params) {
      userErrors {
        message
      }
      userId
    }
  }
`

const ReAuthWithMicrosoftMutation = (
  atmosphere: Atmosphere,
  variables: {code: string; pseudoId?: string; params: string},
  onCompleted: (error?: string) => void
) => {
  return commitMutation<TReAuthWithMicrosoftMutation>(atmosphere, {
    mutation,
    variables,
    onError: (err) => onCompleted(getMutationError(err).message),
    onCompleted: (res) => {
      const [userError] = res.loginWithMicrosoft.userErrors
      onCompleted(userError?.message)
    }
  })
}

export default ReAuthWithMicrosoftMutation
