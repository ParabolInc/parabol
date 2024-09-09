import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {handleSuccessfulLogin} from '~/utils/handleSuccessfulLogin'
import {VerifyEmailMutation as TSignUpWithPasswordMutation} from '../__generated__/VerifyEmailMutation.graphql'
import {HistoryLocalHandler, StandardMutation} from '../types/relayMutations'
import handleAuthenticationRedirect from './handlers/handleAuthenticationRedirect'

const mutation = graphql`
  mutation VerifyEmailMutation(
    $verificationToken: ID!
    $invitationToken: ID!
    $isInvitation: Boolean!
  ) {
    verifyEmail(verificationToken: $verificationToken) {
      error {
        message
      }
      user {
        featureFlags {
          signUpDestinationTeam
        }
        teams {
          id
        }
      }
      ...handleSuccessfulLogin_UserLogInPayload @relay(mask: false)
    }
    acceptTeamInvitation(invitationToken: $invitationToken) @include(if: $isInvitation) {
      ...AcceptTeamInvitationMutationReply @relay(mask: false)
    }
  }
`
const VerifyEmailMutation: StandardMutation<TSignUpWithPasswordMutation, HistoryLocalHandler> = (
  atmosphere,
  variables,
  {onError, onCompleted, history}
) => {
  return commitMutation<TSignUpWithPasswordMutation>(atmosphere, {
    mutation,
    variables: {...variables, isInvitation: !!variables.invitationToken},
    onError,
    onCompleted: (res, errors) => {
      const {acceptTeamInvitation, verifyEmail} = res
      const {user} = verifyEmail
      const authToken = acceptTeamInvitation?.authToken ?? verifyEmail.authToken
      onCompleted({verifyEmail}, errors)
      if (authToken) {
        handleSuccessfulLogin(verifyEmail)
        atmosphere.setAuthToken(authToken)

        const redirectPath = user?.featureFlags.signUpDestinationTeam
          ? `/team/${user?.teams?.[0]?.id}`
          : '/meetings'

        handleAuthenticationRedirect(acceptTeamInvitation, {atmosphere, history, redirectPath})
      }
    }
  })
}

export default VerifyEmailMutation
