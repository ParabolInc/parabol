import {ViewerNotOnTeam_viewer} from '__generated__/ViewerNotOnTeam_viewer.graphql'
import React, {useEffect} from 'react'
import Helmet from 'react-helmet'
import {createFragmentContainer, graphql} from 'react-relay'
import Ellipsis from 'universal/components/Ellipsis/Ellipsis'
import PrimaryButton from 'universal/components/PrimaryButton'
import AcceptTeamInvitationMutation from 'universal/mutations/AcceptTeamInvitationMutation'
import useAtmosphere from '../hooks/useAtmosphere'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InviteDialog from './InviteDialog'
import DialogContent from './DialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import DialogTitle from './DialogTitle'
import TeamInvitationWrapper from './TeamInvitationWrapper'
import useRouter from 'universal/hooks/useRouter'
import getValidRedirectParam from 'universal/utils/getValidRedirectParam'

interface Props {
  teamId: string
  viewer: ViewerNotOnTeam_viewer
}

const ViewerNotOnTeam = (props: Props) => {
  const {teamId, viewer} = props
  const {teamInvitation} = viewer
  const atmosphere = useAtmosphere()
  const {authObj} = atmosphere
  const {history} = useRouter()

  useEffect(() => {
    if (teamInvitation) {
      // if an invitation already exists, accept it
      AcceptTeamInvitationMutation(atmosphere, {invitationToken: teamInvitation.token}, {history})
    } else if (authObj && authObj.tms && authObj.tms.includes(teamId)) {
      // if already on the team, goto team dash
      const redirectTo = getValidRedirectParam()
      const nextRoute = redirectTo || `/team/${teamId}`
      history.replace(nextRoute)
    }
  }, [])

  // listen for a team invitation
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
      <InviteDialog>
        <Helmet title={`Invitation Required`} />
        <DialogTitle>Invitation Required</DialogTitle>
        <DialogContent>
          <InvitationDialogCopy>You’re almost on the team!</InvitationDialogCopy>
          <InvitationDialogCopy>Just ask a team member for an invitation.</InvitationDialogCopy>
          <InvitationDialogCopy>This page will redirect automatically.</InvitationDialogCopy>
          <InvitationCenteredCopy>
            <PrimaryButton size='medium' waiting>
              <span>Waiting for Invitation</span>
              <Ellipsis />
            </PrimaryButton>
          </InvitationCenteredCopy>
        </DialogContent>
      </InviteDialog>
    </TeamInvitationWrapper>
  )
}

export default createFragmentContainer(
  ViewerNotOnTeam,
  graphql`
    fragment ViewerNotOnTeam_viewer on User {
      teamInvitation(teamId: $teamId) {
        token
      }
    }
  `
)
