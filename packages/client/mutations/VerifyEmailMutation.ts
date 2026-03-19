import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {handleSuccessfulLogin} from '~/utils/handleSuccessfulLogin'
import type {VerifyEmailMutation as TSignUpWithPasswordMutation} from '../__generated__/VerifyEmailMutation.graphql'
import type {NavigateLocalHandler, StandardMutation} from '../types/relayMutations'
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
      ...handleSuccessfulLogin_UserLogInPayload @relay(mask: false)
    }
    acceptTeamInvitation(invitationToken: $invitationToken) @include(if: $isInvitation) {
      ...AcceptTeamInvitationMutationReply @relay(mask: false)
    }
  }
`
const VerifyEmailMutation: StandardMutation<TSignUpWithPasswordMutation, NavigateLocalHandler> = (
  atmosphere,
  variables,
  {onError, onCompleted, navigate}
) => {
  return commitMutation<TSignUpWithPasswordMutation>(atmosphere, {
    mutation,
    variables: {...variables, isInvitation: !!variables.invitationToken},
    onError,
    onCompleted: (res, errors) => {
      const {acceptTeamInvitation, verifyEmail} = res
      onCompleted({verifyEmail}, errors)
      if (!errors) {
        handleSuccessfulLogin(atmosphere, verifyEmail)
        const redirectPath = '/meetings'

        handleAuthenticationRedirect(acceptTeamInvitation, {
          atmosphere,
          navigate,
          redirectPath
        })
      }
    }
  })
}

export default VerifyEmailMutation
