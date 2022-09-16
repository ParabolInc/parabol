import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {AuthenticationError} from '../types/constEnums'
import {LocalHandlers, StandardMutation} from '../types/relayMutations'
import {EmailPasswordResetMutation as TEmailPasswordResetMutation} from '../__generated__/EmailPasswordResetMutation.graphql'

export enum ForgotPasswordResType {
  GOOGLE = 'goog',
  SAML = 'saml',
  SUCCESS = 'success'
}

const mutation = graphql`
  mutation EmailPasswordResetMutation($email: ID!) {
    emailPasswordReset(email: $email) {
      ... on ErrorPayload {
        error {
          message
        }
      }
    }
  }
`

const EmailPasswordResetMutation: StandardMutation<TEmailPasswordResetMutation, LocalHandlers> = (
  atmosphere,
  variables,
  {history, onError, onCompleted}: LocalHandlers = {}
) => {
  return commitMutation<TEmailPasswordResetMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted: (res, err) => {
      if (onCompleted) onCompleted(res, err)
      const {email} = variables
      const params = new URLSearchParams()
      if (res.emailPasswordReset?.error) {
        const {message} = res.emailPasswordReset.error
        if (message === AuthenticationError.USER_EXISTS_GOOGLE) {
          params.set('type', ForgotPasswordResType.GOOGLE)
        } else if (message === AuthenticationError.USER_EXISTS_SAML) {
          params.set('type', ForgotPasswordResType.SAML)
        } else return
      } else {
        params.set('type', ForgotPasswordResType.SUCCESS)
        params.set('email', email)
      }
      if (history) history.push(`/forgot-password/submitted?${params}`)
    }
  })
}

export default EmailPasswordResetMutation
