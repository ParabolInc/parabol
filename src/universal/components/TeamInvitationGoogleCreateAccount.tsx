import {TeamInvitationGoogleCreateAccount_verifiedInvitation} from '__generated__/TeamInvitationGoogleCreateAccount_verifiedInvitation.graphql'
import {WebAuth} from 'auth0-js'
import React, {Component} from 'react'
import styled from 'react-emotion'
import Helmet from 'react-helmet'
import {createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router'
import LoginMutation from 'universal/mutations/LoginMutation'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import {PALETTE} from '../styles/paletteV2'
import auth0Authorize from '../utils/auth0Authorize'
import makeWebAuth from '../utils/makeWebAuth'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import EmailPasswordAuthForm from './EmailPasswordAuthForm'
import GoogleOAuthButtonBlock from './GoogleOAuthButtonBlock'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InvitationDialog from './InvitationDialog'
import InvitationDialogContent from './InvitationDialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import InvitationDialogTitle from './InvitationDialogTitle'
import LINK = PALETTE.LINK
import PlainButton from 'universal/components/PlainButton/PlainButton'
import HorizontalSeparator from 'universal/components/HorizontalSeparator/HorizontalSeparator'
import AuthPrivacyFooter from 'universal/components/AuthPrivacyFooter'

interface Props
  extends WithAtmosphereProps,
    WithMutationProps,
    RouteComponentProps<{token: string}> {
  verifiedInvitation: TeamInvitationGoogleCreateAccount_verifiedInvitation
}

interface State {
  isEmailFallback: boolean
}

const StyledDialog = styled(InvitationDialog)({
  maxWidth: 356
})

const StyledContent = styled(InvitationDialogContent)({
  paddingLeft: 0,
  paddingRight: 0
})

const CopyMargins = styled('div')({
  padding: '0 2rem'
})

const UseEmailFallback = styled(PlainButton)({
  margin: '1rem',
  color: LINK.BLUE
})

const TeamName = styled('span')({
  fontWeight: 600,
  whiteSpace: 'nowrap'
})

class TeamInvitationGoogleCreateAccount extends Component<Props, State> {
  webAuth?: WebAuth
  state = {
    isEmailFallback: false
  }

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
    const {teamInvitation} = verifiedInvitation
    if (!teamInvitation) return
    const {email} = teamInvitation
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

  useEmail = () => {
    this.setState({
      isEmailFallback: true
    })
  }

  render () {
    const {error, submitting, verifiedInvitation} = this.props
    const {isEmailFallback} = this.state
    const {teamInvitation, teamName} = verifiedInvitation
    if (!teamInvitation) return null
    const {email} = teamInvitation
    return (
      <StyledDialog>
        <Helmet title={`Sign up with Google | Team Invitation`} />
        <InvitationDialogTitle>Welcome!</InvitationDialogTitle>
        <StyledContent>
          <CopyMargins>
            <InvitationDialogCopy>
              It looks like your email is hosted by Google.
            </InvitationDialogCopy>
            <InvitationDialogCopy>
              Tap below for immediate access to your team: <TeamName>{teamName}</TeamName>
            </InvitationDialogCopy>
          </CopyMargins>
          <InvitationCenteredCopy>
            <GoogleOAuthButtonBlock
              label='Sign up using Google'
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
  graphql`
    fragment TeamInvitationGoogleCreateAccount_verifiedInvitation on VerifiedInvitationPayload {
      teamInvitation {
        email
      }
      teamName
    }
  `
)
