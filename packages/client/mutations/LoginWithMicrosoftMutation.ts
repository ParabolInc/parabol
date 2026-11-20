import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {handleSuccessfulLogin} from '~/utils/handleSuccessfulLogin'
import type {LoginWithMicrosoftMutation as TLoginWithMicrosoftMutation} from '../__generated__/LoginWithMicrosoftMutation.graphql'
import type {NavigateLocalHandler, StandardMutation} from '../types/relayMutations'
import redirectAfterSignIn from './handlers/redirectAfterSignIn'

const mutation = graphql`
  mutation LoginWithMicrosoftMutation($code: ID!, $invitationToken: ID, $pseudoId: ID, $params: String!) {
    loginWithMicrosoft(
      code: $code
      pseudoId: $pseudoId
      invitationToken: $invitationToken
      params: $params
    ) {
      ...handleSuccessfulLogin_UserLogInPayload @relay(mask: false)
    }
  }
`
const LoginWithMicrosoftMutation: StandardMutation<
  TLoginWithMicrosoftMutation,
  NavigateLocalHandler
> = (atmosphere, variables, {onError, onCompleted, navigate}) => {
  return commitMutation<TLoginWithMicrosoftMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted: (res, errors) => {
      const {loginWithMicrosoft} = res
      onCompleted({loginWithMicrosoft}, errors)
      if (errors) return
      handleSuccessfulLogin(atmosphere, loginWithMicrosoft)
      redirectAfterSignIn(atmosphere, variables.invitationToken, navigate)
    }
  })
}

export default LoginWithMicrosoftMutation
