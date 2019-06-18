import React, {Component} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router'
import {WithAtmosphereProps} from 'universal/decorators/withAtmosphere/withAtmosphere'
import withAtmosphere from '../decorators/withAtmosphere/withAtmosphere'
import TeamInvitationAccept from './TeamInvitationAccept'
import TeamInvitationEmailCreateAccount from './TeamInvitationEmailCreateAccount'
import TeamInvitationEmailSignin from './TeamInvitationEmailSignin'
import TeamInvitationErrorAccepted from './TeamInvitationErrorAccepted'
import TeamInvitationErrorExpired from './TeamInvitationErrorExpired'
import TeamInvitationErrorNotFound from './TeamInvitationErrorNotFound'
import TeamInvitationGoogleCreateAccount from './TeamInvitationGoogleCreateAccount'
import TeamInvitationGoogleSignin from './TeamInvitationGoogleSignin'
import {TeamInvitationDialog_verifiedInvitation} from '__generated__/TeamInvitationDialog_verifiedInvitation.graphql'

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
    const {atmosphere, verifiedInvitation} = this.props
    const {errorType, isGoogle, user} = verifiedInvitation
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
      return <TeamInvitationAccept verifiedInvitation={verifiedInvitation} />
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

export default createFragmentContainer(
  withAtmosphere(withRouter(TeamInvitationDialog)),
  graphql`
    fragment TeamInvitationDialog_verifiedInvitation on VerifiedInvitationPayload {
      ...TeamInvitationErrorAccepted_verifiedInvitation
      ...TeamInvitationErrorExpired_verifiedInvitation
      ...TeamInvitationGoogleSignin_verifiedInvitation
      ...TeamInvitationGoogleCreateAccount_verifiedInvitation
      ...TeamInvitationEmailSignin_verifiedInvitation
      ...TeamInvitationEmailCreateAccount_verifiedInvitation
      ...TeamInvitationAccept_verifiedInvitation
      errorType
      isGoogle
      user {
        preferredName
      }
    }
  `
)
