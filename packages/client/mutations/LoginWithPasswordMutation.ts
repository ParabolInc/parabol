import {LoginWithPasswordMutation as TLoginWithPasswordMutation} from '../__generated__/LoginWithPasswordMutation.graphql'
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {HistoryLocalHandler, StandardMutation} from '../types/relayMutations'
import handleAuthenticationRedirect from './handlers/handleAuthenticationRedirect'
import {AuthenticationError} from '../types/constEnums'
import Auth0ClientManager from '../utils/Auth0ClientManager'

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

const handleAuth0Fallback = async (
  email: string,
  password: string,
  onError: any,
  onCompleted: any
) => {
  // need to go out to auth0
  const manager = new Auth0ClientManager()

  const errorResult = await manager.login(email, password)
  if (!errorResult) {
    onCompleted()
    return
  }
  onError(new Error(errorResult.error_description))
}

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
      if (uiError?.message === AuthenticationError.MISSING_HASH) {
        const {email, password} = variables
        handleAuth0Fallback(email, password, onError, onCompleted).catch()
        return
      }
      onCompleted({loginWithPassword}, errors)
      if (!uiError && !errors) {
        const authToken = acceptTeamInvitation.authToken || loginWithPassword.authToken
        atmosphere.setAuthToken(authToken)
        handleAuthenticationRedirect(acceptTeamInvitation, {atmosphere, history})
      }
    }
  })
}

export default LoginWithPasswordMutation
