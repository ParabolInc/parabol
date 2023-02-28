import graphql from 'babel-plugin-relay/macro'
import {Snack} from '../../components/Snackbar'
import {OnNextHandler, OnNextHistoryContext} from '../../types/relayMutations'
import {
  NotificationEnum,
  popNotificationToast_notification
} from '../../__generated__/popNotificationToast_notification.graphql'
import SetNotificationStatusMutation from '../SetNotificationStatusMutation'
import mapDiscussionMentionedToToast from './mapDiscussionMentionedToToast'
import mapResponseMentionedToToast from './mapResponseMentionedToToast'
import mapResponseRepliedToToast from './mapResponseRepliedToToast'
import mapTeamsLimitExceededToToast from './mapTeamsLimitExceededToToast'

const typePicker: Partial<
  Record<NotificationEnum, (notification: any, context: OnNextHistoryContext) => Snack | null>
> = {
  DISCUSSION_MENTIONED: mapDiscussionMentionedToToast,
  RESPONSE_MENTIONED: mapResponseMentionedToToast,
  RESPONSE_REPLIED: mapResponseRepliedToToast,
  TEAMS_LIMIT_EXCEEDED: mapTeamsLimitExceededToToast
}

graphql`
  fragment popNotificationToast_notification on AddedNotification {
    addedNotification {
      type
      id
      ...mapDiscussionMentionedToToast_notification @relay(mask: false)
      ...mapResponseMentionedToToast_notification @relay(mask: false)
      ...mapResponseRepliedToToast_notification @relay(mask: false)
      ...mapTeamsLimitExceededToToast_notification @relay(mask: false)
    }
  }
`

export const popNotificationToastOnNext: OnNextHandler<
  popNotificationToast_notification,
  OnNextHistoryContext
> = (payload, {atmosphere, history}) => {
  const {addedNotification} = payload
  const {type} = addedNotification
  const specificNotificationToastMapper = typePicker[type]
  if (!specificNotificationToastMapper) {
    return
  }

  const notificationSnack = specificNotificationToastMapper(addedNotification, {
    atmosphere,
    history
  })

  if (!notificationSnack) {
    return
  }

  const callback = notificationSnack.onManualDismiss
  notificationSnack.onManualDismiss = () => {
    const {id: notificationId} = addedNotification
    SetNotificationStatusMutation(
      atmosphere,
      {
        notificationId,
        status: 'CLICKED'
      },
      {}
    )

    callback?.()
  }

  atmosphere.eventEmitter.emit('addSnackbar', notificationSnack)
}
