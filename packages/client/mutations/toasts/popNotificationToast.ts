import graphql from 'babel-plugin-relay/macro'
import {Snack} from '../../components/Snackbar'
import {ValueOf} from '../../types/generics'
import {OnNextHandler, OnNextHistoryContext} from '../../types/relayMutations'
import {
  NotificationEnum,
  popNotificationToast_notification
} from '../../__generated__/popNotificationToast_notification.graphql'
import SetNotificationStatusMutation from '../SetNotificationStatusMutation'
import mapResponseMentionedToToast from './mapResponseMentionedToToast'
import mapResponseRepliedToToast from './mapResponseRepliedToToast'

const typePicker = {
  KICKED_OUT: null,
  PAYMENT_REJECTED: null,
  TASK_INVOLVES: null,
  PROMOTE_TO_BILLING_LEADER: null,
  TEAMS_LIMIT_EXCEEDED: null,
  TEAM_ARCHIVED: null,
  TEAM_INVITATION: null,
  MEETING_STAGE_TIME_LIMIT_END: null,
  RESPONSE_MENTIONED: mapResponseMentionedToToast,
  RESPONSE_REPLIED: mapResponseRepliedToToast
} as Record<
  NotificationEnum,
  ((notification: any, context: OnNextHistoryContext) => Snack | null) | null
>

graphql`
  fragment popNotificationToast_notification on AddedNotification {
    addedNotification {
      type
      id
      ...mapResponseMentionedToToast_notification @relay(mask: false)
      ...mapResponseRepliedToToast_notification @relay(mask: false)
    }
  }
`

export const popNotificationToastOnNext: OnNextHandler<
  popNotificationToast_notification,
  OnNextHistoryContext
> = (payload, {atmosphere, history}) => {
  const {addedNotification} = payload
  const {type} = addedNotification
  const specificNotificationToastMapper = typePicker[type] as ValueOf<typeof typePicker>
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

  if (notificationSnack.action) {
    const callback = notificationSnack.action.callback
    notificationSnack.action = {
      ...notificationSnack.action,
      callback: () => {
        const {id: notificationId} = addedNotification
        SetNotificationStatusMutation(
          atmosphere,
          {
            notificationId,
            status: 'CLICKED'
          },
          {}
        )

        callback()
      }
    }
  }
  atmosphere.eventEmitter.emit('addSnackbar', notificationSnack)
}
