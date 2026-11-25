import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {handleSuccessfulLogin} from '~/utils/handleSuccessfulLogin'
import type {LoginWithPasswordMutation as TLoginWithPasswordMutation} from '../__generated__/LoginWithPasswordMutation.graphql'
import type {NavigateLocalHandler, StandardMutation} from '../types/relayMutations'
import redirectAfterSignIn from './handlers/redirectAfterSignIn'

const mutation = graphql`
  mutation LoginWithPasswordMutation($email: ID!, $password: String!) {
    loginWithPassword(email: $email, password: $password) {
      ...handleSuccessfulLogin_UserLogInPayload @relay(mask: false)
    }
  }
`

interface LocalHandler extends NavigateLocalHandler {
  invitationToken: string | null | undefined
}

const LoginWithPasswordMutation: StandardMutation<TLoginWithPasswordMutation, LocalHandler> = (
  atmosphere,
  variables,
  {onError, onCompleted, navigate, invitationToken}
) => {
  return commitMutation<TLoginWithPasswordMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted: (res, errors) => {
      const {loginWithPassword} = res
      onCompleted({loginWithPassword}, errors)
      if (errors) return
      handleSuccessfulLogin(atmosphere, loginWithPassword)
      redirectAfterSignIn(atmosphere, invitationToken, navigate)
    }
  })
}

export default LoginWithPasswordMutation
