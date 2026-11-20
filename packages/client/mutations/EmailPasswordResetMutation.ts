import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {EmailPasswordResetMutation as TEmailPasswordResetMutation} from '../__generated__/EmailPasswordResetMutation.graphql'
import type {LocalHandlers, StandardMutation} from '../types/relayMutations'
import getMutationError from '../utils/relay/getMutationError'
import {snackOnError} from './handlers/snackOnError'

export enum ForgotPasswordResType {
  GOOGLE = 'goog',
  MICROSOFT = 'ms',
  SAML = 'saml',
  SUCCESS = 'success'
}

const mutation = graphql`
  mutation EmailPasswordResetMutation($email: ID!) {
    emailPasswordReset(email: $email) {
      success
    }
  }
`

const getSignInMethodType = (error: Error) => {
  const {code} = getMutationError(error)
  if (code === 'SIGN_IN_WITH_GOOGLE') return ForgotPasswordResType.GOOGLE
  if (code === 'SIGN_IN_WITH_MICROSOFT') return ForgotPasswordResType.MICROSOFT
  if (code === 'SIGN_IN_WITH_SSO') return ForgotPasswordResType.SAML
  return undefined
}

const EmailPasswordResetMutation: StandardMutation<TEmailPasswordResetMutation, LocalHandlers> = (
  atmosphere,
  variables,
  {navigate, onError, onCompleted}: LocalHandlers = {}
) => {
  return commitMutation<TEmailPasswordResetMutation>(atmosphere, {
    mutation,
    variables,
    onError: (error) => {
      const signInMethodType = getSignInMethodType(error)
      if (signInMethodType && navigate) {
        navigate({href: `/forgot-password/submitted?type=${signInMethodType}`})
        return
      }
      if (onError) onError(error)
      else snackOnError(atmosphere)(error)
    },
    onCompleted: (res, err) => {
      if (onCompleted) onCompleted(res, err)
      const params = new URLSearchParams({
        type: ForgotPasswordResType.SUCCESS,
        email: variables.email
      })
      if (navigate) navigate({href: `/forgot-password/submitted?${params}`})
    }
  })
}

export default EmailPasswordResetMutation
