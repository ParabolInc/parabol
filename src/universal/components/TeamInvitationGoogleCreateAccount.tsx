import {TeamInvitationGoogleCreateAccount_verifiedInvitation} from '__generated__/TeamInvitationGoogleCreateAccount_verifiedInvitation.graphql'
import {WebAuth} from 'auth0-js'
import React, {Component} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import Helmet from 'react-helmet'
import {RouteComponentProps, withRouter} from 'react-router'
import LoginMutation from 'universal/mutations/LoginMutation'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import {PALETTE} from '../styles/paletteV2'
import auth0Authorize from '../utils/auth0Authorize'
import makeWebAuth from '../utils/makeWebAuth'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import EmailPasswordAuthForm from './EmailPasswordAuthForm'
import GoogleOAuthButton from './GoogleOAuthButton'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InvitationDialog from './InvitationDialog'
import InvitationDialogContent from './InvitationDialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import InvitationDialogTitle from './InvitationDialogTitle'
import StyledError from './StyledError'
import LINK = PALETTE.LINK
import PlainButton from 'universal/components/PlainButton/PlainButton'
import StyledTip from './StyledTip'

interface Props
  extends WithAtmosphereProps,
    WithMutationProps,
    RouteComponentProps<{token: string}> {
  verifiedInvitation: TeamInvitationGoogleCreateAccount_verifiedInvitation
}

interface State {
  isEmailFallback: boolean
}

const UseEmailFallback = styled(PlainButton)({
  margin: '1rem',
  color: LINK.BLUE
})

const HR = styled('hr')({
  marginTop: '1rem',
  width: '100%'
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
      submitMutation
    } = this.props
    if (!this.webAuth) return
    submitMutation()
    let res
    try {
      res = await auth0Authorize(this.webAuth)
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
      <InvitationDialog>
        <Helmet title={`Sign up with Google | Team Invitation`} />
        <InvitationDialogTitle>Welcome!</InvitationDialogTitle>
        <InvitationDialogContent>
          <InvitationDialogCopy>It looks like your email is hosted by Google.</InvitationDialogCopy>
          <InvitationDialogCopy>
            Click below for immediate access to {teamName}
          </InvitationDialogCopy>
          <InvitationCenteredCopy>
            <GoogleOAuthButton
              label='Sign up using Google'
              onClick={this.onOAuth}
              waiting={submitting}
            />
            {error && <StyledError>Error logging in! Did you close the popup?</StyledError>}
            {submitting && <StyledTip>Continue through the login popup</StyledTip>}
            {isEmailFallback ? (
              <HR />
            ) : (
              <UseEmailFallback onClick={this.useEmail}>Sign up without Google</UseEmailFallback>
            )}
            {isEmailFallback && <EmailPasswordAuthForm email={email} />}
          </InvitationCenteredCopy>
        </InvitationDialogContent>
      </InvitationDialog>
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
