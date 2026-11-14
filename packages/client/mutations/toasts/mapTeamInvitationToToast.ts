import graphql from 'babel-plugin-relay/macro'
import {matchPath} from 'react-router'
import type {mapTeamInvitationToToast_notification$data} from '../../__generated__/mapTeamInvitationToToast_notification.graphql'
import type {Snack} from '../../components/Snackbar'
import type {OnNextNavigateContext} from '../../types/relayMutations'
import AcceptTeamInvitationMutation from '../AcceptTeamInvitationMutation'
import makeNotificationToastKey from './makeNotificationToastKey'
import type {UnmaskedNotification} from './mapNotificationToToast'

graphql`
  fragment mapTeamInvitationToToast_notification on NotificationTeamInvitation {
    id
    team {
      name
    }
    invitation {
      token
      inviter {
        preferredName
      }
    }
  }
`

const mapTeamInvitationToToast = (
  notification: UnmaskedNotification<mapTeamInvitationToToast_notification$data>,
  {atmosphere, navigate}: OnNextNavigateContext
): Snack | null => {
  const {id: notificationId, team, invitation} = notification
  const {token: invitationToken, inviter} = invitation
  // The invitation-required page promises to redirect once someone invites the viewer, so accept instead of asking
  if (matchPath('/invitation-required', window.location.pathname)) {
    const meetingId = new URLSearchParams(window.location.search).get('meetingId')
    AcceptTeamInvitationMutation(
      atmosphere,
      {invitationToken, notificationId},
      {navigate, meetingId}
    )
    return null
  }
  return {
    autoDismiss: 10,
    key: makeNotificationToastKey(notificationId),
    message: `${inviter.preferredName} has invited you to join their team ${team.name}`,
    action: {
      label: 'Accept!',
      callback: () => {
        AcceptTeamInvitationMutation(atmosphere, {invitationToken, notificationId}, {navigate})
      }
    }
  }
}

export default mapTeamInvitationToToast
