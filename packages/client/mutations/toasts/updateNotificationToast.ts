import graphql from 'babel-plugin-relay/macro'
import {OnNextHandler, OnNextHistoryContext} from '../../types/relayMutations'
import {updateNotificationToast_notification$data} from '../../__generated__/updateNotificationToast_notification.graphql'
import makeNotificationToastKey from './makeNotificationToastKey'

graphql`
  fragment updateNotificationToast_notification on UpdatedNotification {
    updatedNotification {
      id
      status
    }
  }
`

export const updateNotificationToastOnNext: OnNextHandler<
  updateNotificationToast_notification$data,
  OnNextHistoryContext
> = (payload, {atmosphere}) => {
  const {updatedNotification} = payload

  if (['CLICKED', 'READ'].includes(updatedNotification.status)) {
    atmosphere.eventEmitter.emit(
      'removeSnackbar',
      (snack) => snack.key === makeNotificationToastKey(updatedNotification.id)
    )
  }
}
