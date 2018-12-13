import {AcceptTeamInvitationMutation_team} from '__generated__/AcceptTeamInvitationMutation_team.graphql'
import {commitMutation, graphql} from 'react-relay'
import {RecordProxy} from 'relay-runtime'
import handleAddTeamMembers from 'universal/mutations/handlers/handleAddTeamMembers'
import handleOnCompletedToastError from 'universal/mutations/handlers/handleOnCompletedToastError'
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications'
import getGraphQLError from 'universal/utils/relay/getGraphQLError'
import getInProxy from 'universal/utils/relay/getInProxy'

graphql`
  fragment AcceptTeamInvitationMutation_team on AcceptTeamInvitationPayload {
    teamMember {
      ...CompleteTeamMemberFrag @relay(mask: false)
    }
    team {
      name
      # alternatively, we could just send down the single stage
      newMeeting {
        ...CompleteNewMeetingFrag @relay(mask: false)
      }
    }
  }
`

graphql`
  fragment AcceptTeamInvitationMutation_notification on AcceptTeamInvitationPayload {
    removedNotificationIds
  }
`

const mutation = graphql`
  mutation AcceptTeamInvitationMutation($invitationToken: ID!) {
    acceptTeamInvitation(invitationToken: $invitationToken) {
      error {
        message
        title
      }
      ...AcceptTeamInvitationMutation_notification @relay(mask: false)
    }
  }
`

export const accceptTeamInvitationNotificationUpdater = (
  payload: RecordProxy,
  {atmosphere, store}
) => {
  const {viewerId} = atmosphere
  const notificationIds = getInProxy(payload, 'removedNotificationIds')
  handleRemoveNotifications(notificationIds, store, viewerId)
}

export const accceptTeamInvitationTeamUpdater = (payload: RecordProxy, {store}) => {
  const teamMember = payload.getLinkedRecord('teamMember')
  handleAddTeamMembers(teamMember, store)
}

export const accceptTeamInvitationNotificationOnNext = (
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

const AcceptTeamInvitationMutation = (atmosphere, variables, {history}, onError, onCompleted) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('accceptTeamInvitation')
      if (!payload) return
      accceptTeamInvitationTeamUpdater(payload, {store})
    },
    onError,
    onCompleted: (data, errors) => {
      if (onCompleted) {
        onCompleted(data, errors)
      }
      const serverError = getGraphQLError(data, errors)
      if (serverError) {
        handleOnCompletedToastError(serverError, atmosphere)
        // give them the benefit of the doubt & don't sign them out
        history.push('/')
        return
      }
      const {
        accceptTeamInvitation: {team}
      } = data
      const {id: teamId, name: teamName} = team
      atmosphere.eventEmitter.emit('addToast', {
        level: 'info',
        autoDismiss: 10,
        title: 'Congratulations!',
        message: `You’ve been added to team ${teamName}`,
        action: {label: 'Great!'}
      })
      history.push(`/team/${teamId}`)
    }
  })
}

export default AcceptTeamInvitationMutation
