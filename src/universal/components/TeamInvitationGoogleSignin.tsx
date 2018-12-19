import {TeamInvitationGoogleSignin_verifiedInvitation} from '__generated__/TeamInvitationGoogleSignin_verifiedInvitation.graphql'
import React, {Component} from 'react'
import Helmet from 'react-helmet'
import {createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router'
import signinAndUpdateToken from 'universal/components/Auth0ShowLock/signinAndUpdateToken'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import auth0Authorize from '../utils/auth0Authorize'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import GoogleOAuthButton from './GoogleOAuthButton'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InvitationDialog from './InvitationDialog'
import InvitationDialogContent from './InvitationDialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import InvitationDialogTitle from './InvitationDialogTitle'
import StyledError from './StyledError'

interface Props extends WithAtmosphereProps, WithMutationProps, RouteComponentProps<{}> {
  verifiedInvitation: TeamInvitationGoogleSignin_verifiedInvitation
}

class TeamInvitationGoogleSignin extends Component<Props> {
  onOAuth = async () => {
    const {atmosphere, history, location, onCompleted, onError, submitMutation} = this.props
    submitMutation()
    let res
    try {
      res = await auth0Authorize()
    } catch (e) {
      onError(e)
      return
    }
    onCompleted()
    const {idToken} = res
    signinAndUpdateToken(atmosphere, history, location, idToken)
  }

  render () {
    const {error, submitting, verifiedInvitation} = this.props
    const {user, teamName} = verifiedInvitation
    if (!user) return null
    const {preferredName} = user
    return (
      <InvitationDialog>
        <Helmet title={`Sign in with Google | Team Invitation`} />
        <InvitationDialogTitle>Welcome back, {preferredName}!</InvitationDialogTitle>
        <InvitationDialogContent>
          <InvitationDialogCopy>You last signed in using Google. </InvitationDialogCopy>
          <InvitationDialogCopy>
            Click below for immediate access to {teamName}
          </InvitationDialogCopy>
          <InvitationCenteredCopy>
            <GoogleOAuthButton
              label='Sign in using Google'
              onClick={this.onOAuth}
              waiting={submitting}
            />
            {error && <StyledError>Error logging in! Did you close the popup?</StyledError>}
          </InvitationCenteredCopy>
        </InvitationDialogContent>
      </InvitationDialog>
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(withRouter(TeamInvitationGoogleSignin))),
  graphql`
    fragment TeamInvitationGoogleSignin_verifiedInvitation on VerifiedInvitationPayload {
      user {
        preferredName
      }
      teamName
    }
  `
)
