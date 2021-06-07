import {EmailPasswordResetMutation as TEmailPasswordResetMutation} from '../__generated__/EmailPasswordResetMutation.graphql'
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {HistoryLocalHandler, StandardMutation} from '../types/relayMutations'
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
const EmailPasswordResetMutation: StandardMutation<
  TEmailPasswordResetMutation,
  HistoryLocalHandler
> = (atmosphere, variables, {history, onError, onCompleted}) => {
  return commitMutation<TEmailPasswordResetMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted: (res, err) => {
      onCompleted(res, err)
      if (res.emailPasswordReset.error) {
        const {message} = res.emailPasswordReset.error
        if (message === AuthenticationError.USER_EXISTS_GOOGLE) {
          history.push(`/forgot-password/submitted?type=${ForgotPasswordTypes.GOOGLE}`)
        } else if (message === AuthenticationError.USER_EXISTS_SAML) {
          history.push(`/forgot-password/submitted?type=${ForgotPasswordTypes.SAML}`)
        }
      } else {
        history.push(`/forgot-password/submitted?type=${ForgotPasswordTypes.SUCCESS}`)
      }
    }
  })
}

export default EmailPasswordResetMutation
