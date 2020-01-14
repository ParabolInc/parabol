import {AcceptTeamInvitationMutation_team} from '../__generated__/AcceptTeamInvitationMutation_team.graphql'
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import handleAddTeamMembers from './handlers/handleAddTeamMembers'
import handleRemoveNotifications from './handlers/handleRemoveNotifications'
import getGraphQLError from '../utils/relay/getGraphQLError'
import getInProxy from '../utils/relay/getInProxy'
import {
  HistoryMaybeLocalHandler,
  OnNextHandler,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import {AcceptTeamInvitationMutation as TAcceptTeamInvitationMutation} from '../__generated__/AcceptTeamInvitationMutation.graphql'
import handleAddTeams from './handlers/handleAddTeams'
import getValidRedirectParam from '../utils/getValidRedirectParam'
import fromTeamMemberId from '../utils/relay/fromTeamMemberId'
import {AcceptTeamInvitationMutation_notification} from '__generated__/AcceptTeamInvitationMutation_notification.graphql'

graphql`
  fragment AcceptTeamInvitationMutation_team on AcceptTeamInvitationPayload {
    teamMember {
      ...CompleteTeamMemberFrag @relay(mask: false)
    }
    team {
      name
      activeMeetings {
        ...MeetingSelector_meeting
      }
    }
  }
`
graphql`
  fragment AcceptTeamInvitationMutation_notification on AcceptTeamInvitationPayload {
    # this is just for the user that accepted the invitation
    removedNotificationIds
    team {
      ...DashAlertMeetingActiveMeetings
      id
      name
      isPaid
      activeMeetings {
        id
      }
    }
    # this is just for the team lead
    teamLead {
      suggestedActions {
        ...TimelineSuggestedAction_suggestedAction @relay(mask: false)
      }
    }
  }
`

const mutation = graphql`
  mutation AcceptTeamInvitationMutation($invitationToken: ID!, $notificationId: ID) {
    acceptTeamInvitation(invitationToken: $invitationToken, notificationId: $notificationId) {
      authToken
      error {
        message
        title
      }
      ...AcceptTeamInvitationMutation_notification @relay(mask: false)
    }
  }
`

export const acceptTeamInvitationNotificationUpdater: SharedUpdater<AcceptTeamInvitationMutation_notification> = (
  payload,
  {store}
) => {
  const team = payload.getLinkedRecord('team')
  if (!team) return
  handleAddTeams(team, store)
  const notificationIds = getInProxy(payload, 'removedNotificationIds')
  handleRemoveNotifications(notificationIds, store)

  // the viewer could have requested the meeting & had it return null
  const activeMeetings = team.getLinkedRecords('activeMeetings')
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (viewer) {
    activeMeetings.forEach((activeMeeting) => {
      const meetingId = activeMeeting.getValue('id')
      viewer.setLinkedRecord(activeMeeting, 'meeting', {meetingId})
    })
  }
}

export const acceptTeamInvitationTeamUpdater: SharedUpdater<AcceptTeamInvitationMutation_team> = (
  payload,
  {store}
) => {
  const teamMember = payload.getLinkedRecord('teamMember')
  handleAddTeamMembers(teamMember, store)
}

export const acceptTeamInvitationTeamOnNext: OnNextHandler<AcceptTeamInvitationMutation_team> = (
  payload,
  {atmosphere}
) => {
  const {team, teamMember} = payload
  if (!team || !teamMember) return
  const {name: teamName} = team
  const {id: teamMemberId, preferredName} = teamMember
  const {teamId, userId} = fromTeamMemberId(teamMemberId)
  atmosphere.eventEmitter.emit(
    'removeSnackbar',
    (snack) => snack.key === `pushInvitation:${teamId}:${userId}`
  )
  atmosphere.eventEmitter.emit('addSnackbar', {
    autoDismiss: 5,
    key: `acceptTeamInvitation:${teamMemberId}`,
    message: `${preferredName} just joined team ${teamName}`
  })
}

interface LocalHandler extends HistoryMaybeLocalHandler {
  meetingId?: string | null
}

const AcceptTeamInvitationMutation: StandardMutation<
  TAcceptTeamInvitationMutation,
  LocalHandler
> = (atmosphere, variables, {history, onCompleted, onError, meetingId}) => {
  return commitMutation<TAcceptTeamInvitationMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('acceptTeamInvitation')
      if (!payload) return
      acceptTeamInvitationNotificationUpdater(payload, {atmosphere, store})
    },
    onError,
    onCompleted: (data, errors) => {
      if (onCompleted) {
        onCompleted(data, errors)
      }
      const serverError = getGraphQLError(data, errors)
      if (serverError) return
      const {acceptTeamInvitation} = data
      const {authToken, team} = acceptTeamInvitation
      atmosphere.setAuthToken(authToken)
      if (!team) return
      const {id: teamId, name: teamName, activeMeetings} = team
      const activeMeeting =
        (meetingId && activeMeetings.find((meeting) => meeting.id === meetingId)) ||
        activeMeetings[0]
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: `addedToTeam:${teamId}`,
        autoDismiss: 5,
        message: `Congratulations! You’ve been added to team ${teamName}`
      })
      const redirectTo = getValidRedirectParam()
      if (history) {
        if (redirectTo) {
          history.push(redirectTo)
        } else if (activeMeeting) {
          history.push(`/meet/${activeMeeting.id}`)
        } else {
          history.push(`/team/${teamId}`)
        }
      }
    }
  })
}

export default AcceptTeamInvitationMutation
