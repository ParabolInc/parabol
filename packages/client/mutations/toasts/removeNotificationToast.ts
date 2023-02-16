import graphql from 'babel-plugin-relay/macro'
import {OnNextHandler, OnNextHistoryContext} from '../../types/relayMutations'
import {removeNotificationToast_notification} from '../../__generated__/removeNotificationToast_notification.graphql'
import makeNotificationToastKey from './makeNotificationToastKey'

graphql`
  fragment removeNotificationToast_notification on RemovedNotification {
    removedNotificationId
  }
`

export const removeNotificationToastOnNext: OnNextHandler<
  removeNotificationToast_notification,
  OnNextHistoryContext
> = (payload, {atmosphere}) => {
  const {removedNotificationId} = payload
  atmosphere.eventEmitter.emit(
    'removeSnackbar',
    (snack) => snack.key === makeNotificationToastKey(removedNotificationId)
  )
}
