import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {HistoryLocalHandler, StandardMutation} from '../types/relayMutations'
import {LoginWithPasswordMutation as TLoginWithPasswordMutation} from '../__generated__/LoginWithPasswordMutation.graphql'
import handleAuthenticationRedirect from './handlers/handleAuthenticationRedirect'

const mutation = graphql`
  mutation LoginWithPasswordMutation($email: ID!, $password: String!, $invitationToken: ID) {
    loginWithPassword(email: $email, password: $password) {
      error {
        message
      }
      authToken
      user {
        tms
        ...UserAnalyticsFrag @relay(mask: false)
      }
    }
    acceptTeamInvitation(invitationToken: $invitationToken) {
      ...AcceptTeamInvitationMutationReply @relay(mask: false)
    }
  }
`

const LoginWithPasswordMutation: StandardMutation<
  TLoginWithPasswordMutation,
  HistoryLocalHandler
> = (atmosphere, variables, {onError, onCompleted, history}) => {
  return commitMutation<TLoginWithPasswordMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted: (res, errors) => {
      const {acceptTeamInvitation, loginWithPassword} = res
      const {error: uiError} = loginWithPassword
      onCompleted({loginWithPassword}, errors)
      if (!uiError && !errors) {
        const authToken = acceptTeamInvitation.authToken || loginWithPassword.authToken
        atmosphere.setAuthToken(authToken, loginWithPassword)
        handleAuthenticationRedirect(acceptTeamInvitation, {atmosphere, history})
      }
    }
  })
}

export default LoginWithPasswordMutation
