import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {EmailPasswordResetMutation as TEmailPasswordResetMutation} from '../__generated__/EmailPasswordResetMutation.graphql'
import type {LocalHandlers, StandardMutation} from '../types/relayMutations'
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
      ... on EmailPasswordResetSuccess {
        userErrors {
          code
          message
        }
      }
    }
  }
`

const EmailPasswordResetMutation: StandardMutation<TEmailPasswordResetMutation, LocalHandlers> = (
  atmosphere,
  variables,
  {navigate, onError, onCompleted}: LocalHandlers = {}
) => {
  return commitMutation<TEmailPasswordResetMutation>(atmosphere, {
    mutation,
    variables,
    onError: onError ?? snackOnError(atmosphere),
    onCompleted: (res, err) => {
      if (onCompleted) onCompleted(res, err)
      const {email} = variables
      const params = new URLSearchParams()
      const [userError] = res.emailPasswordReset.userErrors ?? []
      if (userError) {
        const {code} = userError
        if (code === 'SIGN_IN_WITH_GOOGLE') {
          params.set('type', ForgotPasswordResType.GOOGLE)
        } else if (code === 'SIGN_IN_WITH_MICROSOFT') {
          params.set('type', ForgotPasswordResType.MICROSOFT)
        } else if (code === 'SIGN_IN_WITH_SSO') {
          params.set('type', ForgotPasswordResType.SAML)
        } else return
      } else {
        params.set('type', ForgotPasswordResType.SUCCESS)
        params.set('email', email)
      }
      if (navigate) navigate(`/forgot-password/submitted?${params}`)
    }
  })
}

export default EmailPasswordResetMutation
