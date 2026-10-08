import graphql from 'babel-plugin-relay/macro'
import type {popNotificationToast_notification$data} from '../../__generated__/popNotificationToast_notification.graphql'
import type {OnNextHandler, OnNextNavigateContext} from '../../types/relayMutations'
import SetNotificationStatusMutation from '../SetNotificationStatusMutation'
import mapNotificationToToast from './mapNotificationToToast'

graphql`
  fragment popNotificationToast_notification on AddedNotification {
    addedNotification {
      type
      id
      ...mapDiscussionMentionedToToast_notification @relay(mask: false) @alias
      ...mapResponseMentionedToToast_notification @relay(mask: false) @alias
      ...mapMentionedToToast_notification @relay(mask: false) @alias
      ...mapResponseRepliedToToast_notification @relay(mask: false) @alias
      ...mapTeamsLimitReminderToToast_notification @relay(mask: false) @alias
      ...mapPromptToJoinOrgToToast_notification @relay(mask: false) @alias
      ...mapRequestToJoinOrgToToast_notification @relay(mask: false) @alias
      ...mapTeamHealthResponseDueToToast_notification @relay(mask: false) @alias
    }
  }
`

export const popNotificationToastOnNext: OnNextHandler<
  popNotificationToast_notification$data,
  OnNextNavigateContext
> = (payload, {atmosphere, navigate}) => {
  const {addedNotification} = payload
  const notificationSnack = mapNotificationToToast(addedNotification, {atmosphere, navigate})

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
