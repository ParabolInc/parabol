import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {ReAuthWithMicrosoftMutation as TReAuthWithMicrosoftMutation} from '../__generated__/ReAuthWithMicrosoftMutation.graphql'
import type Atmosphere from '../Atmosphere'
import getServerError from '../utils/relay/getServerError'

const mutation = graphql`
  mutation ReAuthWithMicrosoftMutation($code: ID!, $pseudoId: ID, $params: String!) {
    loginWithMicrosoft(code: $code, pseudoId: $pseudoId, invitationToken: "", params: $params) {
      error {
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
    onError: (err) => onCompleted(getServerError(err)?.message ?? err.message),
    onCompleted: (res) => {
      const {loginWithMicrosoft} = res
      if (loginWithMicrosoft.error) {
        onCompleted(loginWithMicrosoft.error.message)
      } else {
        onCompleted()
      }
    }
  })
}

export default ReAuthWithMicrosoftMutation
