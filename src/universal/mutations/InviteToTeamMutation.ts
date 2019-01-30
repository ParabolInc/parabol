import {InviteToTeamMutation} from '__generated__/InviteToTeamMutation.graphql'
import {InviteToTeamMutation_notification} from '__generated__/InviteToTeamMutation_notification.graphql'
import {commitMutation, graphql} from 'react-relay'
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications'
import {IInviteToTeamOnMutationArguments} from '../types/graphql'
import {LocalHandlers} from '../types/relayMutations'
import AcceptTeamInvitationMutation from './AcceptTeamInvitationMutation'
import handleRemoveSuggestedActions from './handlers/handleRemoveSuggestedActions'

graphql`
  fragment InviteToTeamMutation_notification on InviteToTeamPayload {
    teamInvitationNotification {
      id
      type
      team {
        name
      }
      invitation {
        inviter {
          preferredName
        }
        token
      }
    }
  }
`

const mutation = graphql`
  mutation InviteToTeamMutation($teamId: ID!, $invitees: [Email!]!) {
    inviteToTeam(invitees: $invitees, teamId: $teamId) {
      error {
        message
      }
      invitees
      removedSuggestedActionId
      ...InviteToTeamMutation_notification @relay(mask: false)
    }
  }
`

const popInvitationReceivedToast = (
  notification: InviteToTeamMutation_notification['teamInvitationNotification'] | null,
  {atmosphere, history}
) => {
  if (!notification) return
  const {
    id: notificationId,
    team: {name: teamName},
    invitation: {
      token: invitationToken,
      inviter: {preferredName: inviterName}
    }
  } = notification
  atmosphere.eventEmitter.emit('addToast', {
    autoDismiss: 10,
    title: 'You’re invited!',
    message: `${inviterName} would like you to join their team ${teamName}`,
    action: {
      label: 'Accept!',
      callback: () => {
        AcceptTeamInvitationMutation(atmosphere, {invitationToken, notificationId}, {history})
      }
    }
  })
}

export const inviteToTeamNotificationUpdater = (payload, {atmosphere, store}) => {
  const {viewerId} = atmosphere
  const teamInvitationNotification = payload.getLinkedRecord('teamInvitationNotification')
  handleAddNotifications(teamInvitationNotification, store, viewerId)
}

export const inviteToTeamNotificationOnNext = (
  payload: InviteToTeamMutation_notification,
  {atmosphere, history}
) => {
  const {teamInvitationNotification} = payload
  popInvitationReceivedToast(teamInvitationNotification, {atmosphere, history})
}

const InviteToTeamMutation = (
  atmosphere: any,
  variables: IInviteToTeamOnMutationArguments,
  {onError, onCompleted}: LocalHandlers
) => {
  return commitMutation<InviteToTeamMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('inviteToTeam')
      if (!payload) return
      const removedSuggestedActionId = payload.getValue('removedSuggestedActionId')
      handleRemoveSuggestedActions(removedSuggestedActionId, store)
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
    },
    onError
  })
}

export default InviteToTeamMutation
