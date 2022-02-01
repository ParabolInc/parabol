import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {HistoryLocalHandler, StandardMutation} from '../types/relayMutations'
import {SignUpWithPasswordMutation as TSignUpWithPasswordMutation} from '../__generated__/SignUpWithPasswordMutation.graphql'
import handleAuthenticationRedirect from './handlers/handleAuthenticationRedirect'

const mutation = graphql`
  mutation SignUpWithPasswordMutation(
    $email: ID!
    $password: String!
    $invitationToken: ID
    $segmentId: ID
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
    acceptTeamInvitation(invitationToken: $invitationToken) {
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
    variables,
    onError,
    onCompleted: (res, errors) => {
      const {acceptTeamInvitation, signUpWithPassword} = res
      const {error: uiError} = signUpWithPassword
      onCompleted({signUpWithPassword}, errors)
      if (!uiError && !errors) {
        const authToken = acceptTeamInvitation.authToken || signUpWithPassword.authToken
        atmosphere.setAuthToken(authToken, signUpWithPassword)
        handleAuthenticationRedirect(acceptTeamInvitation, {atmosphere, history})
      }
    }
  })
}

export default SignUpWithPasswordMutation
