import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {handleSuccessfulLogin} from '~/utils/handleSuccessfulLogin'
import {LoginWithMicrosoftMutation as TLoginWithMicrosoftMutation} from '../__generated__/LoginWithMicrosoftMutation.graphql'
import {HistoryLocalHandler, StandardMutation} from '../types/relayMutations'
import {handleAcceptTeamInvitationErrors} from './AcceptTeamInvitationMutation'
import handleAuthenticationRedirect from './handlers/handleAuthenticationRedirect'

const mutation = graphql`
  mutation LoginWithMicrosoftMutation(
    $code: ID!
    $invitationToken: ID!
    $pseudoId: ID
    $isInvitation: Boolean!
    $params: String!
  ) {
    loginWithMicrosoft(
      code: $code
      pseudoId: $pseudoId
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
const LoginWithMicrosoftMutation: StandardMutation<
  TLoginWithMicrosoftMutation,
  HistoryLocalHandler
> = (atmosphere, variables, {onError, onCompleted, history}) => {
  return commitMutation<TLoginWithMicrosoftMutation>(atmosphere, {
    mutation,
    variables: {...variables, isInvitation: !!variables.invitationToken},
    onError,
    onCompleted: (res, errors) => {
      const {acceptTeamInvitation, loginWithMicrosoft} = res
      onCompleted({loginWithMicrosoft}, errors)
      const {error: uiError} = loginWithMicrosoft
      handleAcceptTeamInvitationErrors(atmosphere, acceptTeamInvitation)
      if (!uiError && !errors) {
        handleSuccessfulLogin(atmosphere, loginWithMicrosoft)
        const authToken = acceptTeamInvitation?.authToken || loginWithMicrosoft.authToken!
        atmosphere.setAuthToken(authToken)
        handleAuthenticationRedirect(acceptTeamInvitation, {atmosphere, history})
      }
    }
  })
}

export default LoginWithMicrosoftMutation
