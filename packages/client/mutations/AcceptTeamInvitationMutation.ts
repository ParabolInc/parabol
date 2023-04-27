import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {InvitationTokenError, LOCKED_MESSAGE} from '~/types/constEnums'
import {AcceptTeamInvitationMutation_notification$data} from '~/__generated__/AcceptTeamInvitationMutation_notification.graphql'
import Atmosphere from '../Atmosphere'
import {
  HistoryMaybeLocalHandler,
  OnNextHandler,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import fromTeamMemberId from '../utils/relay/fromTeamMemberId'
import getGraphQLError from '../utils/relay/getGraphQLError'
import {AcceptTeamInvitationMutation as TAcceptTeamInvitationMutation} from '../__generated__/AcceptTeamInvitationMutation.graphql'
import {AcceptTeamInvitationMutation_team$data} from '../__generated__/AcceptTeamInvitationMutation_team.graphql'
import handleAddOrganization from './handlers/handleAddOrganization'
import handleAddTeamMembers from './handlers/handleAddTeamMembers'
import handleAddTeams from './handlers/handleAddTeams'
import handleAuthenticationRedirect from './handlers/handleAuthenticationRedirect'

graphql`
  fragment AcceptTeamInvitationMutation_team on AcceptTeamInvitationPayload {
    teamMember {
      id
      isLead
      isNotRemoved
      picture
      preferredName
      teamId
      userId
      user {
        isConnected
      }
    }
    team {
      name
      organization {
        id
        name
      }
      ...DashNavListTeam
    }
  }
`

graphql`
  fragment AcceptTeamInvitationMutation_notification on AcceptTeamInvitationPayload {
    # this is just for the user that accepted the invitation
    team {
      ...DashNavListTeam
      ...MeetingsDashActiveMeetings
      id
      name
      isPaid
      activeMeetings {
        id
      }
    }
    meeting {
      id
      ... on TeamPromptMeeting {
        meetingSeries {
          id
          mostRecentMeeting {
            id
          }
        }
      }
    }
    teamMember {
      ...DashboardAvatar_teamMember
    }
    # this is just for the team lead
    teamLead {
      suggestedActions {
        ...TimelineSuggestedAction_suggestedAction @relay(mask: false)
      }
    }
  }
`

graphql`
  fragment AcceptTeamInvitationMutationReply on AcceptTeamInvitationPayload {
    authToken
    error {
      message
    }
    meetingId
    team {
      id
      activeMeetings {
        id
      }
    }
  }
`

const mutation = graphql`
  mutation AcceptTeamInvitationMutation($invitationToken: ID!, $notificationId: ID) {
    acceptTeamInvitation(invitationToken: $invitationToken, notificationId: $notificationId) {
      ...AcceptTeamInvitationMutationReply @relay(mask: false)
      ...AcceptTeamInvitationMutation_notification @relay(mask: false)
    }
  }
`

export const acceptTeamInvitationNotificationUpdater: SharedUpdater<
  AcceptTeamInvitationMutation_notification$data
> = (payload, {store}) => {
  const team = payload.getLinkedRecord('team')
  if (!team) return
  handleAddTeams(team, store)

  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (viewer) {
    // if they checked canAccess before, we need to update it
    viewer.setValue(true, 'canAccess', {entity: 'Team', id: team.getValue('id')})

    // the viewer could have requested the meeting & had it return null
    const requestedMeeting = payload.getLinkedRecord('meeting')
    if (requestedMeeting) {
      const requestedMeetingId = requestedMeeting.getValue('id')
      viewer.setLinkedRecord(requestedMeeting, 'meeting', {meetingId: requestedMeetingId})
      viewer.setValue(true, 'canAccess', {entity: 'Meeting', id: requestedMeetingId})
    }
    const activeMeetings = team.getLinkedRecords('activeMeetings')
    activeMeetings.forEach((activeMeeting) => {
      const meetingId = activeMeeting.getValue('id')
      viewer.setLinkedRecord(activeMeeting, 'meeting', {meetingId})
    })
  }
}

export const acceptTeamInvitationTeamUpdater: SharedUpdater<
  AcceptTeamInvitationMutation_team$data
> = (payload, {store}) => {
  const teamMember = payload.getLinkedRecord('teamMember')
  handleAddTeamMembers(teamMember, store)
  const team = payload.getLinkedRecord('team')
  const organization = team.getLinkedRecord('organization')
  handleAddOrganization(organization, store)
  handleAddTeams(team, store)
}

export const acceptTeamInvitationTeamOnNext: OnNextHandler<
  AcceptTeamInvitationMutation_team$data
> = (payload, {atmosphere}) => {
  const {team, teamMember} = payload
  const {viewerId} = atmosphere
  if (!team || !teamMember) return
  const {name: teamName} = team
  const {id: teamMemberId, preferredName} = teamMember
  const {teamId, userId} = fromTeamMemberId(teamMemberId)
  atmosphere.eventEmitter.emit(
    'removeSnackbar',
    (snack) => snack.key === `pushInvitation:${teamId}:${userId}`
  )

  if (userId !== viewerId) {
    atmosphere.eventEmitter.emit('addSnackbar', {
      autoDismiss: 5,
      key: `acceptTeamInvitation:${teamMemberId}`,
      message: `${preferredName} just joined team ${teamName}`
    })
  }
}

interface LocalHandler extends HistoryMaybeLocalHandler {
  meetingId?: string | null
  ignoreApproval?: boolean
}

export const handleAcceptTeamInvitationErrors = (
  atmosphere: Atmosphere,
  acceptTeamInvitation: null | undefined | {error?: {message: string} | null}
) => {
  if (acceptTeamInvitation?.error) {
    const {message} = acceptTeamInvitation.error
    if (message === InvitationTokenError.ALREADY_ACCEPTED) return
    atmosphere.eventEmitter.emit('addSnackbar', {
      autoDismiss: 0,
      key: `acceptTeamInvitation:${message}`,
      message
    })
  }
}

const AcceptTeamInvitationMutation: StandardMutation<
  TAcceptTeamInvitationMutation,
  LocalHandler
> = (
  atmosphere,
  variables,
  {history, onCompleted, onError, meetingId: locallyRequestedMeetingId, ignoreApproval}
) => {
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
      const {acceptTeamInvitation} = data
      const {authToken, team} = acceptTeamInvitation
      const serverError = getGraphQLError(data, errors)
      if (serverError) {
        const message = serverError.message
        if (message === InvitationTokenError.ALREADY_ACCEPTED) {
          handleAuthenticationRedirect(acceptTeamInvitation, {
            atmosphere,
            history,
            meetingId: locallyRequestedMeetingId
          })
        } else if (!ignoreApproval) {
          atmosphere.eventEmitter.emit('addSnackbar', {
            autoDismiss: 0,
            key: `acceptTeamInvitation:${message}`,
            message,
            action:
              message === LOCKED_MESSAGE.TEAM_INVITE
                ? {
                    label: 'Contact Sales',
                    callback: () => window.open('mailto:love@parabol.co?subject=Overdue Payment')
                  }
                : undefined
          })
        }
        if (!ignoreApproval) return
      }
      atmosphere.setAuthToken(authToken)
      if (!team) return
      const {id: teamId, name: teamName} = team
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: `addedToTeam:${teamId}`,
        autoDismiss: 5,
        message: `Congratulations! You’ve been added to team ${teamName}`
      })
      handleAuthenticationRedirect(acceptTeamInvitation, {
        atmosphere,
        history,
        meetingId: locallyRequestedMeetingId
      })
    }
  })
}

export default AcceptTeamInvitationMutation
