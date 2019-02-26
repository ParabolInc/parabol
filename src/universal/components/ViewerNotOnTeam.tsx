import {ViewerNotOnTeam_viewer} from '__generated__/ViewerNotOnTeam_viewer.graphql'
import React, {useEffect} from 'react'
import Helmet from 'react-helmet'
import {createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router'
import Ellipsis from 'universal/components/Ellipsis/Ellipsis'
import PrimaryButton from 'universal/components/PrimaryButton'
import AcceptTeamInvitationMutation from 'universal/mutations/AcceptTeamInvitationMutation'
import useAtmosphere from '../hooks/useAtmosphere'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InvitationDialog from './InvitationDialog'
import InvitationDialogContent from './InvitationDialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import InvitationDialogTitle from './InvitationDialogTitle'
import TeamInvitationWrapper from './TeamInvitationWrapper'

interface Props extends RouteComponentProps<{}> {
  viewer: ViewerNotOnTeam_viewer
}

const ViewerNotOnTeam = (props: Props) => {
  const {history, viewer} = props
  const {teamInvitation} = viewer
  const atmosphere = useAtmosphere()
  // if an invitation already exists, accept it
  useEffect(() => {
    if (teamInvitation) {
      AcceptTeamInvitationMutation(atmosphere, {invitationToken: teamInvitation.token}, {history})
    }
  })

  useEffect(() => {
    if (teamInvitation) return
    const handler = (invitation) => {
      const {
        invitation: {token: invitationToken},
        id: notificationId
      } = invitation
      AcceptTeamInvitationMutation(atmosphere, {invitationToken, notificationId}, {history})
    }
    atmosphere.eventEmitter.on('inviteToTeam', handler)
    return () => {
      atmosphere.eventEmitter.off('inviteToTeam', handler)
    }
  }, [])
  if (teamInvitation) {
    return null
  }
  return (
    <TeamInvitationWrapper>
      <InvitationDialog>
        <Helmet title={`Invitation Required`} />
        <InvitationDialogTitle>Invitation Required</InvitationDialogTitle>
        <InvitationDialogContent>
          <InvitationDialogCopy>You’re almost on the team!</InvitationDialogCopy>
          <InvitationDialogCopy>Just ask a team member for an invitation.</InvitationDialogCopy>
          <InvitationDialogCopy>This page will redirect automatically.</InvitationDialogCopy>
          <InvitationCenteredCopy>
            <PrimaryButton size='medium' waiting>
              <span>Waiting for Invitation</span>
              <Ellipsis />
            </PrimaryButton>
          </InvitationCenteredCopy>
        </InvitationDialogContent>
      </InvitationDialog>
    </TeamInvitationWrapper>
  )
}

export default createFragmentContainer(
  withRouter(ViewerNotOnTeam),
  graphql`
    fragment ViewerNotOnTeam_viewer on User {
      teamInvitation(teamId: $teamId) {
        token
      }
    }
  `
)
