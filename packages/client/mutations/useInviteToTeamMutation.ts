import graphql from 'babel-plugin-relay/macro'
import {commitMutation, type UseMutationConfig, useMutation} from 'react-relay'
import {matchPath} from 'react-router'
import type {MutationConfig, SelectorStoreUpdater} from 'relay-runtime'
import type {useInviteToTeamMutation as TInviteToTeamMutation} from '../__generated__/useInviteToTeamMutation.graphql'
import type {useInviteToTeamMutation_notification$data} from '../__generated__/useInviteToTeamMutation_notification.graphql'
import type Atmosphere from '../Atmosphere'
import type {OnNextHandler, OnNextNavigateContext, SharedUpdater} from '../types/relayMutations'
import AcceptTeamInvitationMutation from './AcceptTeamInvitationMutation'
import handleAddNotifications from './handlers/handleAddNotifications'
import handleRemoveSuggestedActions from './handlers/handleRemoveSuggestedActions'

graphql`
  fragment useInviteToTeamMutation_notification on InviteToTeamPayload {
    teamInvitationNotification {
      ...TeamInvitationNotification_notification
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
  mutation useInviteToTeamMutation($meetingId: ID, $teamId: ID!, $invitees: [Email!]!) {
    inviteToTeam(meetingId: $meetingId, teamId: $teamId, invitees: $invitees) {
      invitees {
        email
        status
        message
        suggestedEmail
      }
      removedSuggestedActionId
    }
  }
`

const popInvitationReceivedToast = (
  notification: useInviteToTeamMutation_notification$data['teamInvitationNotification'] | null,
  {atmosphere, navigate}: OnNextNavigateContext
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
        AcceptTeamInvitationMutation(atmosphere, {invitationToken, notificationId}, {navigate})
      }
    }
  })
}

export const inviteToTeamNotificationUpdater: SharedUpdater<
  useInviteToTeamMutation_notification$data
> = (payload, {store}) => {
  const teamInvitationNotification = payload.getLinkedRecord('teamInvitationNotification')
  handleAddNotifications(teamInvitationNotification, store)
}

export const inviteToTeamNotificationOnNext: OnNextHandler<
  useInviteToTeamMutation_notification$data,
  OnNextNavigateContext
> = (payload, {atmosphere, navigate}) => {
  const {teamInvitationNotification} = payload
  if (!teamInvitationNotification) return
  const isWaiting = !!matchPath('/invitation-required', window.location.pathname)
  if (isWaiting) {
    const search = new URLSearchParams(window.location.search)
    const meetingId = search.get('meetingId')
    const {id: notificationId, invitation} = teamInvitationNotification
    const {token: invitationToken} = invitation
    AcceptTeamInvitationMutation(
      atmosphere,
      {invitationToken, notificationId},
      {navigate, meetingId}
    )
  } else {
    popInvitationReceivedToast(teamInvitationNotification, {
      atmosphere,
      navigate
    })
  }
}

const updater: SelectorStoreUpdater<TInviteToTeamMutation['response']> = (store) => {
  const payload = store.getRootField('inviteToTeam')
  if (!payload) return
  handleRemoveSuggestedActions(payload.getValue('removedSuggestedActionId'), store)
}

// For callers outside of React, like a snackbar action
export const commitInviteToTeamMutation = (
  atmosphere: Atmosphere,
  config: Omit<MutationConfig<TInviteToTeamMutation>, 'mutation'>
) => commitMutation<TInviteToTeamMutation>(atmosphere, {mutation, updater, ...config})

const useInviteToTeamMutation = () => {
  const [commit, submitting] = useMutation<TInviteToTeamMutation>(mutation)
  const execute = (config: UseMutationConfig<TInviteToTeamMutation>) => {
    return commit({updater, ...config})
  }
  return [execute, submitting] as const
}

export default useInviteToTeamMutation
