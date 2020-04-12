import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps, withRouter} from 'react-router'
import {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import withAtmosphere from '../decorators/withAtmosphere/withAtmosphere'
import TeamInvitationAccept from './TeamInvitationAccept'
import TeamInvitationEmailCreateAccount from './TeamInvitationEmailCreateAccount'
import TeamInvitationEmailSignin from './TeamInvitationEmailSignin'
import TeamInvitationErrorAccepted from './TeamInvitationErrorAccepted'
import TeamInvitationErrorExpired from './TeamInvitationErrorExpired'
import TeamInvitationErrorNotFound from './TeamInvitationErrorNotFound'
import TeamInvitationGoogleCreateAccount from './TeamInvitationGoogleCreateAccount'
import TeamInvitationGoogleSignin from './TeamInvitationGoogleSignin'
import {TeamInvitationDialog_verifiedInvitation} from '../__generated__/TeamInvitationDialog_verifiedInvitation.graphql'
import {LocalStorageKey} from '../types/constEnums'
import TeamInvitationSSO from './TeamInvitationSSO'

interface Props extends WithAtmosphereProps, RouteComponentProps<{token: string}> {
  verifiedInvitation: TeamInvitationDialog_verifiedInvitation
}

class TeamInvitationDialog extends Component<Props> {
  componentDidMount() {
    const {
      match: {
        params: {token}
      }
    } = this.props
    window.localStorage.setItem(LocalStorageKey.INVITATION_TOKEN, token)
  }

  render() {
    const {atmosphere, verifiedInvitation, match} = this.props
    const {params} = match
    const {token: invitationToken} = params
    if (!verifiedInvitation) {
      // rate limit reached
      return <TeamInvitationErrorNotFound />
    }
    const {errorType, isGoogle, user, ssoURL} = verifiedInvitation
    switch (errorType) {
      case 'notFound':
        return <TeamInvitationErrorNotFound />
      case 'accepted':
        return <TeamInvitationErrorAccepted verifiedInvitation={verifiedInvitation} />
      case 'expired':
        return <TeamInvitationErrorExpired verifiedInvitation={verifiedInvitation} />
    }
    const {authToken} = atmosphere
    if (authToken) {
      return <TeamInvitationAccept invitationToken={invitationToken} />
    }
    if (ssoURL) {
      return <TeamInvitationSSO ssoURL={ssoURL} />
    }
    if (user) {
      return isGoogle ? (
        <TeamInvitationGoogleSignin verifiedInvitation={verifiedInvitation} />
      ) : (
        <TeamInvitationEmailSignin
          invitationToken={invitationToken}
          verifiedInvitation={verifiedInvitation}
        />
      )
    }
    return isGoogle ? (
      <TeamInvitationGoogleCreateAccount
        invitationToken={invitationToken}
        verifiedInvitation={verifiedInvitation}
      />
    ) : (
      <TeamInvitationEmailCreateAccount
        invitationToken={invitationToken}
        verifiedInvitation={verifiedInvitation}
      />
    )
  }
}

export default createFragmentContainer(withAtmosphere(withRouter(TeamInvitationDialog)), {
  verifiedInvitation: graphql`
    fragment TeamInvitationDialog_verifiedInvitation on VerifiedInvitationPayload {
      ...TeamInvitationErrorAccepted_verifiedInvitation
      ...TeamInvitationErrorExpired_verifiedInvitation
      ...TeamInvitationGoogleSignin_verifiedInvitation
      ...TeamInvitationGoogleCreateAccount_verifiedInvitation
      ...TeamInvitationEmailSignin_verifiedInvitation
      ...TeamInvitationEmailCreateAccount_verifiedInvitation
      errorType
      isGoogle
      ssoURL
      user {
        preferredName
      }
    }
  `
})
