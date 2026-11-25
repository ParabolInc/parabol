import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {handleSuccessfulLogin} from '~/utils/handleSuccessfulLogin'
import type {VerifyEmailMutation as TVerifyEmailMutation} from '../__generated__/VerifyEmailMutation.graphql'
import type {NavigateLocalHandler, StandardMutation} from '../types/relayMutations'
import redirectAfterSignIn from './handlers/redirectAfterSignIn'

const mutation = graphql`
  mutation VerifyEmailMutation($verificationToken: ID!) {
    verifyEmail(verificationToken: $verificationToken) {
      ...handleSuccessfulLogin_UserLogInPayload @relay(mask: false)
    }
  }
`

interface LocalHandler extends NavigateLocalHandler {
  invitationToken: string | null | undefined
}

const VerifyEmailMutation: StandardMutation<TVerifyEmailMutation, LocalHandler> = (
  atmosphere,
  variables,
  {onError, onCompleted, navigate, invitationToken}
) => {
  return commitMutation<TVerifyEmailMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted: (res, errors) => {
      const {verifyEmail} = res
      onCompleted({verifyEmail}, errors)
      if (errors) return
      handleSuccessfulLogin(atmosphere, verifyEmail)
      redirectAfterSignIn(atmosphere, invitationToken, navigate)
    }
  })
}

export default VerifyEmailMutation
