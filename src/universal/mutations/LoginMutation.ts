import {LoginMutation, LoginMutationVariables} from '__generated__/LoginMutation.graphql'
import {commitMutation, graphql} from 'react-relay'
import SendClientSegmentEventMutation from 'universal/mutations/SendClientSegmentEventMutation'
import getGraphQLError from 'universal/utils/relay/getGraphQLError'
import {LocalHandlers} from '../types/relayMutations'

const mutation = graphql`
  mutation LoginMutation($auth0Token: String!, $invitationToken: ID) {
    login(auth0Token: $auth0Token) {
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
    }
  }
`
const LoginMutation = (
  atmosphere: any,
  variables: LoginMutationVariables,
  {onCompleted, history}: LocalHandlers
) => {
  atmosphere.setAuthToken(variables.auth0Token)
  return commitMutation<LoginMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted: (res, errors) => {
      onCompleted && onCompleted(res, errors)
      const serverError = getGraphQLError(res, errors)
      if (serverError) {
        console.error(serverError.message)
        return
      }
      const {acceptTeamInvitation, login} = res
      const authToken = acceptTeamInvitation.authToken || login.authToken
      atmosphere.setAuthToken(authToken)
      const {tms} = atmosphere.authObj
      const redirectTo = new URLSearchParams(location.search).get('redirectTo')
      const nextUrl = redirectTo || (tms ? '/me' : '/welcome')
      history && history.push(nextUrl)
      SendClientSegmentEventMutation(atmosphere, 'User Login')
    },
    onError: (err) => {
      console.error('Error logging in', err)
    }
  })
}

export default LoginMutation
