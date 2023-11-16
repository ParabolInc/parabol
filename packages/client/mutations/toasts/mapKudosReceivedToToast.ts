import graphql from 'babel-plugin-relay/macro'
import {Snack} from '../../components/Snackbar'
import {mapKudosReceivedToToast_notification$data} from '../../__generated__/mapKudosReceivedToToast_notification.graphql'
import makeNotificationToastKey from './makeNotificationToastKey'
import {OnNextHistoryContext} from '../../types/relayMutations'
import SendClientSideEvent from '../../utils/SendClientSideEvent'
import getReactji from '~/utils/getReactji'

graphql`
  fragment mapKudosReceivedToToast_notification on NotifyKudosReceived {
    id
    type
    name
    picture
    meetingName
    emoji
  }
`

const mapKudosReceivedToToast = (
  notification: mapKudosReceivedToToast_notification$data,
  {atmosphere}: OnNextHistoryContext
): Snack => {
  const {id: notificationId, meetingName, name, emoji} = notification
  const {unicode} = getReactji(emoji)
  return {
    autoDismiss: 5,
    showDismissButton: true,
    key: makeNotificationToastKey(notificationId),
    message: `${unicode} ${name} gave you kudos in ${meetingName}`,
    onShow: () => {
      SendClientSideEvent(atmosphere, 'Snackbar Viewed', {
        snackbarType: 'kudosReceived'
      })
    }
  }
}

export default mapKudosReceivedToToast
