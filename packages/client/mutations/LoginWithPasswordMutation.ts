import {LoginWithPasswordMutation as TLoginWithPasswordMutation} from '../__generated__/LoginWithPasswordMutation.graphql'
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {HistoryLocalHandler, StandardMutation} from '../types/relayMutations'
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
      authToken
      team {
        id
        activeMeetings {
          id
        }
      }
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
      onCompleted(res, errors)
      const {acceptTeamInvitation, loginWithPassword} = res
      const authToken = acceptTeamInvitation.authToken || loginWithPassword.authToken
      atmosphere.setAuthToken(authToken)
      handleAuthenticationRedirect(acceptTeamInvitation, {atmosphere, history})
    }
  })
}

export default LoginWithPasswordMutation
