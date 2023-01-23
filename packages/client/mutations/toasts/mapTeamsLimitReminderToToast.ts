import graphql from 'babel-plugin-relay/macro'
import {Snack} from '../../components/Snackbar'
import {Threshold} from '../../types/constEnums'
import {OnNextHistoryContext} from '../../types/relayMutations'
import makeDateString from '../../utils/makeDateString'
import {mapTeamsLimitReminderToToast_notification} from '../../__generated__/mapTeamsLimitReminderToToast_notification.graphql'
import SendClientSegmentEventMutation from '../SendClientSegmentEventMutation'

graphql`
  fragment mapTeamsLimitReminderToToast_notification on NotifyTeamsLimitReminder {
    id
    scheduledLockAt
    organization {
      id
      name
    }
  }
`

const mapTeamsLimitReminderToToast = (
  notification: mapTeamsLimitReminderToToast_notification,
  {history, atmosphere}: OnNextHistoryContext
): Snack => {
  const {id: notificationId, organization, scheduledLockAt} = notification
  const {name: orgName, id: orgId} = organization

  return {
    autoDismiss: 0,
    key: `newNotification:${notificationId}`,
    message: `"${orgName}" is over the limit of ${
      Threshold.MAX_STARTER_TIER_TEAMS
    } Free Teams. Your free access will end on ${makeDateString(scheduledLockAt)}`,
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
