import {commitMutation, graphql} from 'react-relay'
import {LoginMutation} from '__generated__/LoginMutation.graphql'
import {ILoginOnMutationArguments} from '../types/graphql'
import {LocalHandlers} from '../types/relayMutations'
import getGraphQLError from 'universal/utils/relay/getGraphQLError'
import SendClientSegmentEventMutation from 'universal/mutations/SendClientSegmentEventMutation'

const mutation = graphql`
  mutation LoginMutation($auth0Token: String!, $invitationToken: ID) {
    login(auth0Token: $auth0Token, invitationToken: $invitationToken) {
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

const LoginMutation = (
  atmosphere: any,
  variables: ILoginOnMutationArguments,
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
      const {
        login: {authToken, user}
      } = res
      atmosphere.setAuthToken(authToken)
      const nextUrl =
        new URLSearchParams(location.search).get('redirectTo') ||
        (user && user.tms ? '/me' : '/welcome')
      history && history.push(nextUrl)
      SendClientSegmentEventMutation(atmosphere, 'User Login')
    },
    onError: (err) => {
      console.error('Error logging in', err)
    }
  })
}

export default LoginMutation
