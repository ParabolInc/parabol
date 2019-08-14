import {AcceptTeamInvitationMutation_team} from '../__generated__/AcceptTeamInvitationMutation_team.graphql'
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {RecordProxy} from 'relay-runtime'
import handleAddTeamMembers from './handlers/handleAddTeamMembers'
import handleRemoveNotifications from './handlers/handleRemoveNotifications'
import getGraphQLError from '../utils/relay/getGraphQLError'
import getInProxy from '../utils/relay/getInProxy'
import {LocalHandlers, OnNextHandler, StandardMutation} from '../types/relayMutations'
import {AcceptTeamInvitationMutation as TAcceptTeamInvitationMutation} from '../__generated__/AcceptTeamInvitationMutation.graphql'
import handleAddTeams from './handlers/handleAddTeams'
import {meetingTypeToSlug} from '../utils/meetings/lookups'
import getValidRedirectParam from '../utils/getValidRedirectParam'
import fromTeamMemberId from '../utils/relay/fromTeamMemberId'

graphql`
  fragment AcceptTeamInvitationMutation_team on AcceptTeamInvitationPayload {
    teamMember {
      ...CompleteTeamMemberFrag @relay(mask: false)
    }
    team {
      name
      newMeeting {
        meetingType
        phases {
          phaseType
          meetingId
          stages {
            isComplete
            isNavigable
            isNavigableByFacilitator
            ...NewMeetingCheckInLocalStage @relay(mask: false)
            ...ActionMeetingUpdatesStage @relay(mask: false)
            ... on NewMeetingTeamMemberStage {
              teamMemberId
            }
          }
        }
      }
    }
  }
`
graphql`
  fragment AcceptTeamInvitationMutation_notification on AcceptTeamInvitationPayload {
    # this is just for the user that accepted the invitation
    removedNotificationIds
    team {
      ...CompleteTeamFrag @relay(mask: false)
      newMeeting {
        meetingType
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

export const acceptTeamInvitationNotificationUpdater = (
  payload: RecordProxy<any>,
  {store}
) => {
  const team = payload.getLinkedRecord('team')
  handleAddTeams(team, store)
  const notificationIds = getInProxy(payload, 'removedNotificationIds')
  handleRemoveNotifications(notificationIds, store)
}

export const acceptTeamInvitationTeamUpdater = (payload: RecordProxy, {store}) => {
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

const AcceptTeamInvitationMutation: StandardMutation<TAcceptTeamInvitationMutation> = (
  atmosphere,
  variables,
  {history, onCompleted, onError}: LocalHandlers = {}
) => {
  return commitMutation<TAcceptTeamInvitationMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('acceptTeamInvitation')
      if (!payload) return
      acceptTeamInvitationNotificationUpdater(payload, {store})
    },
    onError,
    onCompleted: (data, errors) => {
      if (onCompleted) {
        onCompleted(data, errors)
      }
      const serverError = getGraphQLError(data, errors)
      if (serverError) return
      const {
        acceptTeamInvitation: {authToken, team}
      } = data
      atmosphere.setAuthToken(authToken)
      if (!team) return
      const {id: teamId, name: teamName, newMeeting} = team
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: `addedToTeam:${teamId}`,
        autoDismiss: 5,
        message: `Congratulations! You’ve been added to team ${teamName}`
      })
      const redirectTo = getValidRedirectParam()
      if (history) {
        if (redirectTo) {
          history.push(redirectTo)
        } else if (newMeeting) {
          const {meetingType} = newMeeting
          const meetingSlug = meetingTypeToSlug[meetingType]
          history.push(`/${meetingSlug}/${teamId}`)
        } else {
          history.push(`/team/${teamId}`)
        }
      }
    }
  })
}

export default AcceptTeamInvitationMutation
