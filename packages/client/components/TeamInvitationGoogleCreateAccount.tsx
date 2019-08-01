import * as Sentry from '@sentry/browser'
import {TeamInvitationGoogleCreateAccount_verifiedInvitation} from '../__generated__/TeamInvitationGoogleCreateAccount_verifiedInvitation.graphql'
import React, {Component} from 'react'
import styled from '@emotion/styled'
import Helmet from 'react-helmet'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps, withRouter} from 'react-router'
import LoginMutation from '../mutations/LoginMutation'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import {PALETTE} from '../styles/paletteV2'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import EmailPasswordAuthForm from './EmailPasswordAuthForm'
import GoogleOAuthButtonBlock from './GoogleOAuthButtonBlock'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InviteDialog from './InviteDialog'
import DialogContent from './DialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import DialogTitle from './DialogTitle'
import PlainButton from './PlainButton/PlainButton'
import HorizontalSeparator from './HorizontalSeparator/HorizontalSeparator'
import AuthPrivacyFooter from './AuthPrivacyFooter'
import {meetingTypeToLabel} from '../utils/meetings/lookups'
import Auth0ClientManager from '../utils/Auth0ClientManager'

interface Props
  extends WithAtmosphereProps,
    WithMutationProps,
    RouteComponentProps<{token: string}> {
  verifiedInvitation: TeamInvitationGoogleCreateAccount_verifiedInvitation
}

interface State {
  isEmailFallback: boolean
}

const StyledDialog = styled(InviteDialog)({
  maxWidth: 356
})

const StyledContent = styled(DialogContent)({
  paddingLeft: 0,
  paddingRight: 0
})

const CopyMargins = styled('div')({
  padding: '0 1.5rem'
})

const UseEmailFallback = styled(PlainButton)({
  margin: '1rem',
  color: PALETTE.LINK_BLUE
})

const TeamName = styled('span')({
  fontWeight: 600,
  whiteSpace: 'nowrap'
})

class TeamInvitationGoogleCreateAccount extends Component<Props, State> {
  state = {
    isEmailFallback: false
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
    const {teamInvitation} = verifiedInvitation
    if (!teamInvitation) return
    const {email} = teamInvitation
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

  useEmail = () => {
    this.setState({
      isEmailFallback: true
    })
  }

  render () {
    const {error, submitting, verifiedInvitation} = this.props
    const {isEmailFallback} = this.state
    const {meetingType, teamInvitation, teamName} = verifiedInvitation
    if (!teamInvitation) return null
    const {email} = teamInvitation
    return (
      <StyledDialog>
        <Helmet title={`Sign up with Google | Team Invitation`} />
        <DialogTitle>
          {meetingType ? `Join ${meetingTypeToLabel[meetingType]} Meeting` : 'Join Team'}
        </DialogTitle>
        <StyledContent>
          <CopyMargins>
            <InvitationDialogCopy>
              It looks like your email is hosted by Google.
            </InvitationDialogCopy>
            <InvitationDialogCopy>
              Tap below for immediate access
              {meetingType ? ' to the team meeting for: ' : ' to your team: '}
              <TeamName>{teamName}</TeamName>
            </InvitationDialogCopy>
          </CopyMargins>
          <InvitationCenteredCopy>
            <GoogleOAuthButtonBlock
              label='Sign up with Google'
              onClick={this.onOAuth}
              isError={!!error}
              submitting={!!submitting}
            />
            {isEmailFallback ? (
              <HorizontalSeparator margin='1rem 0 0' text='or' />
            ) : (
              <UseEmailFallback onClick={this.useEmail}>Sign up without Google</UseEmailFallback>
            )}
            {isEmailFallback && <EmailPasswordAuthForm email={email} />}
          </InvitationCenteredCopy>
          <AuthPrivacyFooter />
        </StyledContent>
      </StyledDialog>
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(withRouter(TeamInvitationGoogleCreateAccount))),
  {
    verifiedInvitation: graphql`
      fragment TeamInvitationGoogleCreateAccount_verifiedInvitation on VerifiedInvitationPayload {
        meetingType
        teamInvitation {
          email
        }
        teamName
      }
    `
  }
)
