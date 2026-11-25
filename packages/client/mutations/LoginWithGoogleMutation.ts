import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {handleSuccessfulLogin} from '~/utils/handleSuccessfulLogin'
import type {LoginWithGoogleMutation as TLoginWithGoogleMutation} from '../__generated__/LoginWithGoogleMutation.graphql'
import type {NavigateLocalHandler, StandardMutation} from '../types/relayMutations'
import redirectAfterSignIn from './handlers/redirectAfterSignIn'

const mutation = graphql`
  mutation LoginWithGoogleMutation($code: ID!, $invitationToken: ID, $pseudoId: ID, $params: String!) {
    loginWithGoogle(
      code: $code
      pseudoId: $pseudoId
      invitationToken: $invitationToken
      params: $params
    ) {
      ...handleSuccessfulLogin_UserLogInPayload @relay(mask: false)
    }
  }
`
const LoginWithGoogleMutation: StandardMutation<TLoginWithGoogleMutation, NavigateLocalHandler> = (
  atmosphere,
  variables,
  {onError, onCompleted, navigate}
) => {
  return commitMutation<TLoginWithGoogleMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted: (res, errors) => {
      const {loginWithGoogle} = res
      onCompleted({loginWithGoogle}, errors)
      if (errors) return
      handleSuccessfulLogin(atmosphere, loginWithGoogle)
      redirectAfterSignIn(atmosphere, variables.invitationToken, navigate)
    }
  })
}

export default LoginWithGoogleMutation
