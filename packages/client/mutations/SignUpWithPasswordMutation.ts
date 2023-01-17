import graphql from 'babel-plugin-relay/macro'
import ReactGA from 'react-ga4'
import {commitMutation} from 'react-relay'
import handleSuccessfulLogin from '~/utils/handleSuccessfulLogin'
import {HistoryLocalHandler, StandardMutation} from '../types/relayMutations'
import {SignUpWithPasswordMutation as TSignUpWithPasswordMutation} from '../__generated__/SignUpWithPasswordMutation.graphql'
import {handleAcceptTeamInvitationErrors} from './AcceptTeamInvitationMutation'
import handleAuthenticationRedirect from './handlers/handleAuthenticationRedirect'

const mutation = graphql`
  mutation SignUpWithPasswordMutation(
    $email: ID!
    $password: String!
    $invitationToken: ID! = ""
    $segmentId: ID
    $isInvitation: Boolean!
  ) {
    signUpWithPassword(
      email: $email
      password: $password
      invitationToken: $invitationToken
      segmentId: $segmentId
    ) {
      error {
        message
      }
      authToken
      user {
        tms
        ...UserAnalyticsFrag @relay(mask: false)
      }
    }
    acceptTeamInvitation(invitationToken: $invitationToken) @include(if: $isInvitation) {
      ...AcceptTeamInvitationMutationReply @relay(mask: false)
    }
  }
`
const SignUpWithPasswordMutation: StandardMutation<
  TSignUpWithPasswordMutation,
  HistoryLocalHandler
> = (atmosphere, variables, {onError, onCompleted, history}) => {
  return commitMutation<TSignUpWithPasswordMutation>(atmosphere, {
    mutation,
    variables: {...variables, isInvitation: !!variables.invitationToken},
    onError,
    onCompleted: (res, errors) => {
      const {acceptTeamInvitation, signUpWithPassword} = res
      const {error: uiError} = signUpWithPassword
      onCompleted({signUpWithPassword}, errors)
      handleAcceptTeamInvitationErrors(atmosphere, acceptTeamInvitation)
      ReactGA.event('sign_up')
      if (!uiError && !errors) {
        handleSuccessfulLogin(signUpWithPassword)
        const authToken = acceptTeamInvitation?.authToken ?? signUpWithPassword.authToken
        atmosphere.setAuthToken(authToken)
        handleAuthenticationRedirect(acceptTeamInvitation, {atmosphere, history})
      }
    }
  })
}

export default SignUpWithPasswordMutation
