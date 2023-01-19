import graphql from 'babel-plugin-relay/macro'
import {Snack} from '../../components/Snackbar'
import {OnNextHistoryContext} from '../../types/relayMutations'
import {mapTeamsLimitReminderToToast_notification} from '../../__generated__/mapTeamsLimitReminderToToast_notification.graphql'
import SendClientSegmentEventMutation from '../SendClientSegmentEventMutation'

graphql`
  fragment mapTeamsLimitReminderToToast_notification on NotifyTeamsLimitReminder {
    id
    organization {
      id
      name
      scheduledLockAt
    }
  }
`

const mapTeamsLimitReminderToToast = (
  notification: mapTeamsLimitReminderToToast_notification,
  {history, atmosphere}: OnNextHistoryContext
): Snack => {
  const {id: notificationId, organization} = notification
  const {name: orgName, id: orgId, scheduledLockAt} = organization

  return {
    autoDismiss: 0,
    key: `newNotification:${notificationId}`,
    message: `"${orgName}" is over the limit of 2 Free Teams. Your free access will end on ${scheduledLockAt}`,
    action: {
      label: 'Upgrade',
      callback: () => {
        history.push(`/me/organizations/${orgId}`)
        SendClientSegmentEventMutation(atmosphere, 'Clicked teams limit reminder snackbar')
      }
    }
  }
}

export default mapTeamsLimitReminderToToast
