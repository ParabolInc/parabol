import graphql from 'babel-plugin-relay/macro'
import type {mapTeamsLimitReminderToToast_notification$data} from '../../__generated__/mapTeamsLimitReminderToToast_notification.graphql'
import type {Snack} from '../../components/Snackbar'
import {Threshold} from '../../types/constEnums'
import type {OnNextNavigateContext} from '../../types/relayMutations'
import makeDateString from '../../utils/makeDateString'
import makeNotificationToastKey from './makeNotificationToastKey'
import type {UnmaskedNotification} from './mapNotificationToToast'

graphql`
  fragment mapTeamsLimitReminderToToast_notification on NotifyTeamsLimitReminder {
    id
    scheduledLockAt
    orgId
    orgName
  }
`

const mapTeamsLimitReminderToToast = (
  notification: UnmaskedNotification<mapTeamsLimitReminderToToast_notification$data>,
  {navigate}: OnNextNavigateContext
): Snack => {
  const {id: notificationId, scheduledLockAt, orgId, orgName} = notification

  return {
    autoDismiss: 0,
    showDismissButton: true,
    key: makeNotificationToastKey(notificationId),
    message: `"${orgName}" is over the limit of ${
      Threshold.MAX_STARTER_TIER_TEAMS
    } free teams. Your free access will end on ${makeDateString(scheduledLockAt)}`,
    action: {
      label: 'Upgrade',
      callback: () => {
        navigate(`/me/organizations/${orgId}`)
      }
    }
  }
}

export default mapTeamsLimitReminderToToast
