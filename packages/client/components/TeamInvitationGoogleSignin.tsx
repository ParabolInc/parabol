import * as Sentry from '@sentry/browser'
import {TeamInvitationGoogleSignin_verifiedInvitation} from '../__generated__/TeamInvitationGoogleSignin_verifiedInvitation.graphql'
import React, {Component} from 'react'
import styled from '@emotion/styled'
import Helmet from 'react-helmet'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps, withRouter} from 'react-router'
import GoogleOAuthButtonBlock from './GoogleOAuthButtonBlock'
import LoginMutation from '../mutations/LoginMutation'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import Auth0ClientManager from '../utils/Auth0ClientManager'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InviteDialog from './InviteDialog'
import DialogContent from './DialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import DialogTitle from './DialogTitle'
import {meetingTypeToLabel} from '../utils/meetings/lookups'

interface Props
  extends WithAtmosphereProps,
    WithMutationProps,
    RouteComponentProps<{token: string}> {
  verifiedInvitation: TeamInvitationGoogleSignin_verifiedInvitation
}

const TeamName = styled('span')({
  fontWeight: 600,
  whiteSpace: 'nowrap'
})

class TeamInvitationGoogleSignin extends Component<Props> {
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
    const {user} = verifiedInvitation
    if (!user) return
    const {email} = user
    submitMutation()
    const manager = new Auth0ClientManager()
    let res
    try {
      res = await manager.loginWithGoogle(email)
    } catch (e) {
      onError(e)
      Sentry.captureException(e)
      return
    }
    onCompleted()
    const {idToken} = res
    LoginMutation(atmosphere, {auth0Token: idToken, invitationToken}, {history})
  }

  render() {
    const {error, submitting, verifiedInvitation} = this.props
    const {meetingType, user, teamName} = verifiedInvitation
    if (!user) return null
    const {preferredName} = user
    return (
      <InviteDialog>
        <Helmet title={`Sign in with Google | Team Invitation`} />
        <DialogTitle>Welcome back, {preferredName}!</DialogTitle>
        <DialogContent>
          <InvitationDialogCopy>You last signed in with Google. </InvitationDialogCopy>
          <InvitationDialogCopy>
            Tap below
            {meetingType
              ? ` to join the ${meetingTypeToLabel[meetingType]} Meeting for: `
              : ' for immediate access to your team: '}
            <TeamName>{teamName}</TeamName>
          </InvitationDialogCopy>
          <InvitationCenteredCopy>
            <GoogleOAuthButtonBlock
              label='Sign in with Google'
              onClick={this.onOAuth}
              isError={!!error}
              submitting={!!submitting}
            />
          </InvitationCenteredCopy>
        </DialogContent>
      </InviteDialog>
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(withRouter(TeamInvitationGoogleSignin))),
  {
    verifiedInvitation: graphql`
      fragment TeamInvitationGoogleSignin_verifiedInvitation on VerifiedInvitationPayload {
        meetingType
        user {
          email
          preferredName
        }
        teamName
      }
    `
  }
)
