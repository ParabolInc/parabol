import {EmailPasswordResetMutation as TEmailPasswordResetMutation} from '../__generated__/EmailPasswordResetMutation.graphql'
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {LocalHandlers, StandardMutation} from '../types/relayMutations'
import {AuthenticationError, ForgotPasswordTypes} from '../types/constEnums'

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
      if (onCompleted) {
        onCompleted(res, err)
      }
      const {email} = variables
      const params = new URLSearchParams()
      if (res.emailPasswordReset.error) {
        const {message} = res.emailPasswordReset.error
        if (message === AuthenticationError.USER_EXISTS_GOOGLE) {
          params.set('type', ForgotPasswordTypes.GOOGLE)
        } else if (message === AuthenticationError.USER_EXISTS_SAML) {
          params.set('type', ForgotPasswordTypes.SAML)
        }
      } else {
        params.set('type', ForgotPasswordTypes.SUCCESS)
        params.set('email', email)
      }
      if (history) history.push(`/forgot-password/submitted?${params}`)
    }
  })
}

export default EmailPasswordResetMutation
