import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {ReAuthWithMicrosoftMutation as TReAuthWithMicrosoftMutation} from '../__generated__/ReAuthWithMicrosoftMutation.graphql'
import type Atmosphere from '../Atmosphere'

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
    onError: (err) => onCompleted(err.message),
    onCompleted: (res) => {
      const {loginWithMicrosoft} = res
      if (loginWithMicrosoft.error) {
        onCompleted(loginWithMicrosoft.error.message)
      } else if (loginWithMicrosoft.userId !== atmosphere.viewerId) {
        onCompleted('The Microsoft account does not match your current account')
      } else {
        onCompleted()
      }
    }
  })
}

export default ReAuthWithMicrosoftMutation
