import graphql from 'babel-plugin-relay/macro'
import {Snack} from '../../components/Snackbar'
import {mapKudosReceivedToToast_notification$data} from '../../__generated__/mapKudosReceivedToToast_notification.graphql'
import makeNotificationToastKey from './makeNotificationToastKey'
import {OnNextHistoryContext} from '../../types/relayMutations'
import SendClientSideEvent from '../../utils/SendClientSideEvent'

graphql`
  fragment mapKudosReceivedToToast_notification on NotifyKudosReceived {
    id
    name
    meetingName
    meetingId
    emojiUnicode
  }
`

const mapKudosReceivedToToast = (
  notification: mapKudosReceivedToToast_notification$data,
  {atmosphere, history}: OnNextHistoryContext
): Snack => {
  const {id: notificationId, meetingName, name, emojiUnicode, meetingId} = notification
  return {
    autoDismiss: 5,
    showDismissButton: true,
    key: makeNotificationToastKey(notificationId),
    message: `${emojiUnicode} ${name} gave you kudos in`,
    action: {
      label: meetingName,
      callback: () => {
        history.push(`/meet/${meetingId}`)
      }
    },
    onShow: () => {
      SendClientSideEvent(atmosphere, 'Snackbar Viewed', {
        snackbarType: 'kudosReceived'
      })
    },
    onManualDismiss: () => {
      SendClientSideEvent(atmosphere, 'Snackbar Clicked', {
        snackbarType: 'kudosReceived'
      })
    }
  }
}

export default mapKudosReceivedToToast
