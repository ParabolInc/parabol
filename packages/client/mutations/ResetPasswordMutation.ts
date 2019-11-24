import {ResetPasswordMutation as TResetPasswordMutation} from '../__generated__/ResetPasswordMutation.graphql'
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {HistoryLocalHandler, StandardMutation} from '../types/relayMutations'
import handleAuthenticationRedirect from './handlers/handleAuthenticationRedirect'

const mutation = graphql`
  mutation ResetPasswordMutation($newPassword: String!$token: ID) {
    resetPassword(newPassword: $newPasswordtoken: $token) {
      error {
        message
      }
      authToken
      user {
        tms
        ...UserAnalyticsFrag @relay(mask: false)
      }
    }
  }
`
const ResetPasswordMutation: StandardMutation<TResetPasswordMutation, HistoryLocalHandler> = (
  atmosphere,
  variables,
  {onError, onCompleted, history}
) => {
  return commitMutation<TResetPasswordMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted: (res, errors) => {
      const {resetPassword} = res
      const {error: uiError} = resetPassword
      onCompleted(res, errors)
      if (!uiError && !errors) {
        const {authToken} = resetPassword
        atmosphere.setAuthToken(authToken)
        handleAuthenticationRedirect(resetPassword, {atmosphere, history})
      }
    }
  })
}

export default ResetPasswordMutation
