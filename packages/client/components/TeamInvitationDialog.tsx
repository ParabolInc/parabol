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

interface Props extends WithAtmosphereProps, RouteComponentProps<{token: string}> {
  verifiedInvitation: TeamInvitationDialog_verifiedInvitation
}

class TeamInvitationDialog extends Component<Props> {
  componentDidMount () {
    const {
      match: {
        params: {token}
      }
    } = this.props
    window.localStorage.setItem('invitationToken', token)
  }

  render () {
    const {atmosphere, verifiedInvitation, match} = this.props
    const {params} = match
    const {token} = params
    const {errorType, isGoogle, user, teamInvitation} = verifiedInvitation
    switch (errorType) {
      case 'notFound':
        return <TeamInvitationErrorNotFound />
      case 'accepted':
        return <TeamInvitationErrorAccepted verifiedInvitation={verifiedInvitation} />
      case 'expired':
        return <TeamInvitationErrorExpired verifiedInvitation={verifiedInvitation} />
    }
    const {authToken} = atmosphere
    const {teamId} = teamInvitation!
    if (authToken) {
      return <TeamInvitationAccept invitationToken={token} teamId={teamId} />
    }
    if (user) {
      return isGoogle ? (
        <TeamInvitationGoogleSignin verifiedInvitation={verifiedInvitation} />
      ) : (
        <TeamInvitationEmailSignin verifiedInvitation={verifiedInvitation} />
      )
    }
    return isGoogle ? (
      <TeamInvitationGoogleCreateAccount verifiedInvitation={verifiedInvitation} />
    ) : (
      <TeamInvitationEmailCreateAccount verifiedInvitation={verifiedInvitation} />
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
      teamInvitation {
        teamId
      }
      errorType
      isGoogle
      user {
        preferredName
      }
    }
  `
})
