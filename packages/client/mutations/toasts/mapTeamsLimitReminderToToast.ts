import graphql from 'babel-plugin-relay/macro'
import {Snack} from '../../components/Snackbar'
import {Threshold} from '../../types/constEnums'
import {OnNextHistoryContext} from '../../types/relayMutations'
import makeDateString from '../../utils/makeDateString'
import {mapTeamsLimitReminderToToast_notification$data} from '../../__generated__/mapTeamsLimitReminderToToast_notification.graphql'
import SendClientSegmentEventMutation from '../SendClientSegmentEventMutation'
import makeNotificationToastKey from './makeNotificationToastKey'

graphql`
  fragment mapTeamsLimitReminderToToast_notification on NotifyTeamsLimitReminder {
    id
    scheduledLockAt
    orgId
    orgName
  }
`

const mapTeamsLimitReminderToToast = (
  notification: mapTeamsLimitReminderToToast_notification$data,
  {history, atmosphere}: OnNextHistoryContext
): Snack => {
  const {id: notificationId, scheduledLockAt, orgId, orgName} = notification

  return {
    autoDismiss: 0,
    showDismissButton: true,
    key: makeNotificationToastKey(notificationId),
    message: `"${orgName}" is over the limit of ${
      Threshold.MAX_STARTER_TIER_TEAMS
    } free teams. Your free access will end on ${makeDateString(scheduledLockAt)}`,
    onShow: () => {
      SendClientSegmentEventMutation(atmosphere, 'Upgrade CTA Viewed', {
        upgradeCTALocation: 'teamsLimitReminderSnackbar',
        orgId
      })
    },
    onManualDismiss: () => {
      SendClientSegmentEventMutation(atmosphere, 'Snackbar Clicked', {
        snackbarType: 'teamsLimitReminder'
      })
    },
    action: {
      label: 'Upgrade',
      callback: () => {
        SendClientSegmentEventMutation(atmosphere, 'Upgrade CTA Clicked', {
          upgradeCTALocation: 'teamsLimitReminderSnackbar'
        })
        history.push(`/me/organizations/${orgId}`)
      }
    }
  }
}

export default mapTeamsLimitReminderToToast
