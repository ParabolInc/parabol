import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useRouter from '../hooks/useRouter'
import AcceptTeamInvitationMutation from '../mutations/AcceptTeamInvitationMutation'
import PushInvitationMutation from '../mutations/PushInvitationMutation'
import {ViewerNotOnTeamQuery} from '../__generated__/ViewerNotOnTeamQuery.graphql'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import Ellipsis from './Ellipsis/Ellipsis'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InvitationDialogCopy from './InvitationDialogCopy'
import InviteDialog from './InviteDialog'
import PrimaryButton from './PrimaryButton'
import TeamInvitationWrapper from './TeamInvitationWrapper'

interface Props {
  queryRef: PreloadedQuery<ViewerNotOnTeamQuery>
}

const query = graphql`
  query ViewerNotOnTeamQuery($teamId: ID, $meetingId: ID) {
    viewer {
      teamInvitation(teamId: $teamId, meetingId: $meetingId) {
        teamInvitation {
          token
        }
        teamId
        meetingId
      }
    }
  }
`

const ViewerNotOnTeam = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<ViewerNotOnTeamQuery>(query, queryRef)
  const {viewer} = data
  const {
    teamInvitation: {teamInvitation, meetingId, teamId}
  } = viewer
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  useDocumentTitle(`Invitation Required`, 'Invitation Required')
  useEffect(
    () => {
      if (teamInvitation) {
        // if an invitation already exists, accept it
        AcceptTeamInvitationMutation(
          atmosphere,
          {invitationToken: teamInvitation.token},
          {history, meetingId}
        )
        return
      } else if (teamId) PushInvitationMutation(atmosphere, {meetingId, teamId})
      return undefined
    },
    [
      /* eslint-disable-line react-hooks/exhaustive-deps*/
    ]
  )

  if (teamInvitation) return null
  return (
    <TeamInvitationWrapper>
      <InviteDialog>
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

export default ViewerNotOnTeam
