import {TeamInvitationGoogleSignin_verifiedInvitation} from '__generated__/TeamInvitationGoogleSignin_verifiedInvitation.graphql'
import {WebAuth} from 'auth0-js'
import React, {Component} from 'react'
import Helmet from 'react-helmet'
import {createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router'
import LoginMutation from 'universal/mutations/LoginMutation'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import auth0Authorize from '../utils/auth0Authorize'
import makeWebAuth from '../utils/makeWebAuth'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import GoogleOAuthButton from './GoogleOAuthButton'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InvitationDialog from './InvitationDialog'
import InvitationDialogContent from './InvitationDialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import InvitationDialogTitle from './InvitationDialogTitle'
import StyledError from './StyledError'
import StyledTip from './StyledTip'

interface Props
  extends WithAtmosphereProps,
    WithMutationProps,
    RouteComponentProps<{token: string}> {
  verifiedInvitation: TeamInvitationGoogleSignin_verifiedInvitation
}

class TeamInvitationGoogleSignin extends Component<Props> {
  webAuth?: WebAuth
  componentDidMount () {
    makeWebAuth()
      .then((webAuth) => {
        this.webAuth = webAuth
      })
      .catch()
  }

  onOAuth = async () => {
    const {
      atmosphere,
      history,
      match: {
        params: {token: invitationToken}
      },
      onCompleted,
      onError,
      submitMutation,
      verifiedInvitation
    } = this.props
    if (!this.webAuth) return
    const {user} = verifiedInvitation
    if (!user) return
    const {email} = user
    submitMutation()
    let res
    try {
      res = await auth0Authorize(this.webAuth, email)
    } catch (e) {
      onError(e)
      return
    }
    onCompleted()
    const {idToken} = res
    LoginMutation(atmosphere, {auth0Token: idToken, invitationToken}, {history})
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
            {error &&
              !submitting && <StyledError>Error logging in! Did you close the popup?</StyledError>}
            {submitting && <StyledTip>Continue through the login popup</StyledTip>}
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
        email
        preferredName
      }
      teamName
    }
  `
)
