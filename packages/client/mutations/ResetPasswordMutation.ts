import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import getValidRedirectParam from '~/utils/getValidRedirectParam'
import type {ResetPasswordMutation as TResetPasswordMutation} from '../__generated__/ResetPasswordMutation.graphql'
import type {NavigateLocalHandler, StandardMutation} from '../types/relayMutations'

const mutation = graphql`
  mutation ResetPasswordMutation($newPassword: String!, $token: ID!) {
    resetPassword(newPassword: $newPassword, token: $token) {
      error {
        message
      }
      user {
        tms
        ...UserAnalyticsFrag @relay(mask: false)
      }
    }
  }
`
const ResetPasswordMutation: StandardMutation<TResetPasswordMutation, NavigateLocalHandler> = (
  atmosphere,
  variables,
  {onError, onCompleted, navigate}
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
        const nextUrl = getValidRedirectParam() || '/meetings'
        navigate(nextUrl)
      }
    }
  })
}

export default ResetPasswordMutation
