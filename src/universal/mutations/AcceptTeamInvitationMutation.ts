import {AcceptTeamInvitationMutation_team} from '__generated__/AcceptTeamInvitationMutation_team.graphql'
import {commitMutation, graphql} from 'react-relay'
import {Disposable, RecordProxy} from 'relay-runtime'
import handleAddTeamMembers from 'universal/mutations/handlers/handleAddTeamMembers'
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications'
import getGraphQLError from 'universal/utils/relay/getGraphQLError'
import getInProxy from 'universal/utils/relay/getInProxy'
import {LocalHandlers} from '../types/relayMutations'
import {
  AcceptTeamInvitationMutation as TAcceptTeamInvitationMutation,
  AcceptTeamInvitationMutationVariables
} from '__generated__/AcceptTeamInvitationMutation.graphql'
import handleAddTeams from 'universal/mutations/handlers/handleAddTeams'
import {meetingTypeToSlug} from 'universal/utils/meetings/lookups'
import getValidRedirectParam from 'universal/utils/getValidRedirectParam'

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
  {atmosphere, store}
) => {
  const {viewerId} = atmosphere
  const team = payload.getLinkedRecord('team')
  handleAddTeams(team, store, viewerId)
  const notificationIds = getInProxy(payload, 'removedNotificationIds')
  handleRemoveNotifications(notificationIds, store, viewerId)
}

export const acceptTeamInvitationTeamUpdater = (payload: RecordProxy, {store}) => {
  const teamMember = payload.getLinkedRecord('teamMember')
  handleAddTeamMembers(teamMember, store)
}

export const acceptTeamInvitationTeamOnNext = (
  payload: AcceptTeamInvitationMutation_team,
  {atmosphere}
) => {
  const teamName = payload.team && payload.team.name
  const preferredName = payload.teamMember && payload.teamMember.preferredName
  if (!preferredName) return
  atmosphere.eventEmitter.emit('addToast', {
    level: 'info',
    autoDismiss: 10,
    title: 'Ahoy, a new crewmate!',
    message: `${preferredName} just joined team ${teamName}`
  })
}

const AcceptTeamInvitationMutation = (
  atmosphere,
  variables: AcceptTeamInvitationMutationVariables,
  {history, onCompleted, onError}: LocalHandlers
): Disposable => {
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
      const {
        acceptTeamInvitation: {authToken, team}
      } = data
      atmosphere.setAuthToken(authToken)
      if (!team) return
      const {id: teamId, name: teamName, newMeeting} = team
      atmosphere.eventEmitter.emit('addToast', {
        level: 'info',
        autoDismiss: 10,
        title: 'Congratulations!',
        message: `You’ve been added to team ${teamName}`,
        action: {label: 'Great!'}
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
