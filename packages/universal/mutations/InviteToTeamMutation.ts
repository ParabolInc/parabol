import {InviteToTeamMutation as TInviteToTeamMutation} from '__generated__/InviteToTeamMutation.graphql'
import {InviteToTeamMutation_notification} from '__generated__/InviteToTeamMutation_notification.graphql'
import {commitMutation, graphql} from 'react-relay'
import {matchPath} from 'react-router'
import {Disposable} from 'relay-runtime'
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications'
import {IInviteToTeamOnMutationArguments} from '../types/graphql'
import {LocalHandlers, OnNextContext} from '../types/relayMutations'
import AcceptTeamInvitationMutation from './AcceptTeamInvitationMutation'
import handleRemoveSuggestedActions from './handlers/handleRemoveSuggestedActions'

graphql`
  fragment InviteToTeamMutation_notification on InviteToTeamPayload {
    teamInvitationNotification {
      id
      type
      team {
        id
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
  {atmosphere, history}: OnNextContext
) => {
  if (!notification) return
  const {
    id: notificationId,
    team: {name: teamName, id: teamId},
    invitation: {
      token: invitationToken,
      inviter: {preferredName: inviterName}
    }
  } = notification
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: `inviteToTeam:${teamId}`,
    autoDismiss: 10,
    message: `${inviterName} has invited you to join their team ${teamName}`,
    action: {
      label: 'Accept!',
      callback: () => {
        AcceptTeamInvitationMutation(atmosphere, {invitationToken, notificationId}, {history})
      }
    }
  })
}

export const inviteToTeamNotificationUpdater = (payload, {store}) => {
  const teamInvitationNotification = payload.getLinkedRecord('teamInvitationNotification')
  handleAddNotifications(teamInvitationNotification, store)
}

export const inviteToTeamNotificationOnNext = (
  payload: InviteToTeamMutation_notification,
  {atmosphere, history}
) => {
  const {teamInvitationNotification} = payload
  if (!teamInvitationNotification) return
  const {
    team: {id: teamId}
  } = teamInvitationNotification
  const isWaiting = !!matchPath(window.location.pathname, {path: `/invitation-required/${teamId}`})
  atmosphere.eventEmitter.emit('inviteToTeam', teamInvitationNotification)
  if (!isWaiting) {
    popInvitationReceivedToast(teamInvitationNotification, {atmosphere, history})
  }
}

const InviteToTeamMutation = (
  atmosphere: any,
  variables: IInviteToTeamOnMutationArguments,
  {onError, onCompleted}: LocalHandlers = {}
): Disposable => {
  return commitMutation<TInviteToTeamMutation>(atmosphere, {
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
