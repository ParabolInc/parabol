import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {handleSuccessfulLogin} from '~/utils/handleSuccessfulLogin'
import type {SignUpWithPasswordMutation as TSignUpWithPasswordMutation} from '../__generated__/SignUpWithPasswordMutation.graphql'
import type {NavigateLocalHandler, StandardMutation} from '../types/relayMutations'
import redirectAfterSignIn from './handlers/redirectAfterSignIn'

const mutation = graphql`
  mutation SignUpWithPasswordMutation(
    $email: ID!
    $password: String!
    $invitationToken: ID
    $pseudoId: ID
    $params: String!
  ) {
    signUpWithPassword(
      email: $email
      password: $password
      invitationToken: $invitationToken
      pseudoId: $pseudoId
      params: $params
    ) {
      ...handleSuccessfulLogin_UserLogInPayload @relay(mask: false)
    }
  }
`
const SignUpWithPasswordMutation: StandardMutation<
  TSignUpWithPasswordMutation,
  NavigateLocalHandler
> = (atmosphere, variables, {onError, onCompleted, navigate}) => {
  return commitMutation<TSignUpWithPasswordMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted: (res, errors) => {
      const {signUpWithPassword} = res
      onCompleted({signUpWithPassword}, errors)
      if (errors) return
      handleSuccessfulLogin(atmosphere, signUpWithPassword)
      redirectAfterSignIn(atmosphere, variables.invitationToken, navigate)
    }
  })
}

export default SignUpWithPasswordMutation
