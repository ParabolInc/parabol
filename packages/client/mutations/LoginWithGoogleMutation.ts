import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {handleSuccessfulLogin} from '~/utils/handleSuccessfulLogin'
import {HistoryLocalHandler, StandardMutation} from '../types/relayMutations'
import {LoginWithGoogleMutation as TLoginWithGoogleMutation} from '../__generated__/LoginWithGoogleMutation.graphql'
import {handleAcceptTeamInvitationErrors} from './AcceptTeamInvitationMutation'
import handleAuthenticationRedirect from './handlers/handleAuthenticationRedirect'

const mutation = graphql`
  mutation LoginWithGoogleMutation(
    $code: ID!
    $invitationToken: ID!
    $segmentId: ID
    $isInvitation: Boolean!
    $params: String!
  ) {
    loginWithGoogle(
      code: $code
      segmentId: $segmentId
      invitationToken: $invitationToken
      params: $params
    ) {
      error {
        message
      }
      ...handleSuccessfulLogin_UserLogInPayload @relay(mask: false)
    }
    # Validation occurs statically https://github.com/graphql/graphql-js/issues/1334
    # A default value is necessary even in the case of @include(if: false)
    acceptTeamInvitation(invitationToken: $invitationToken) @include(if: $isInvitation) {
      ...AcceptTeamInvitationMutationReply @relay(mask: false)
    }
  }
`
const LoginWithGoogleMutation: StandardMutation<TLoginWithGoogleMutation, HistoryLocalHandler> = (
  atmosphere,
  variables,
  {onError, onCompleted, history}
) => {
  return commitMutation<TLoginWithGoogleMutation>(atmosphere, {
    mutation,
    variables: {...variables, isInvitation: !!variables.invitationToken},
    onError,
    onCompleted: (res, errors) => {
      const {acceptTeamInvitation, loginWithGoogle} = res
      onCompleted({loginWithGoogle}, errors)
      const {error: uiError} = loginWithGoogle
      handleAcceptTeamInvitationErrors(atmosphere, acceptTeamInvitation)
      if (!uiError && !errors) {
        handleSuccessfulLogin(loginWithGoogle)
        const authToken = acceptTeamInvitation?.authToken ?? loginWithGoogle.authToken
        atmosphere.setAuthToken(authToken)
        handleAuthenticationRedirect(acceptTeamInvitation, {atmosphere, history})
      }
    }
  })
}

export default LoginWithGoogleMutation
