import graphql from 'babel-plugin-relay/macro'
import {mapMentionedToToast_notification$data} from '../../__generated__/mapMentionedToToast_notification.graphql'
import {Snack} from '../../components/Snackbar'
import {OnNextHistoryContext} from '../../types/relayMutations'
import SendClientSideEvent from '../../utils/SendClientSideEvent'
import makeNotificationToastKey from './makeNotificationToastKey'

graphql`
  fragment mapMentionedToToast_notification on NotifyMentioned {
    id
    senderName
    meetingId
    meetingName
    retroReflection {
      content
    }
    retroDiscussStageIdx
  }
`

const mapMentionedToToast = (
  notification: mapMentionedToToast_notification$data,
  {atmosphere, history}: OnNextHistoryContext
): Snack | null => {
  if (!notification) return null
  const {
    id: notificationId,
    senderName,
    meetingName,
    retroReflection,
    retroDiscussStageIdx,
    meetingId
  } = notification

  const isAnonymous = !senderName
  const authorName = isAnonymous ? 'Someone' : senderName

  let locationType = 'their response'
  let actionLabel = 'See their response'
  let snackbarType = 'responseMentioned'
  let actionUrl = `/meet/${meetingId}`

  if (retroReflection) {
    actionLabel = 'See their reflection'
    locationType = 'their reflection'
    snackbarType = 'reflectionMentioned'
    if (retroDiscussStageIdx) {
      actionUrl = `/meet/${meetingId}/discuss/${retroDiscussStageIdx}`
    }
  }

  const message = `${authorName} mentioned you in ${locationType} in ${meetingName}`

  const goThere = () => {
    history.push(actionUrl)
  }

  return {
    key: makeNotificationToastKey(notificationId),
    autoDismiss: 5,
    message,
    action: {
      label: actionLabel,
      callback: goThere
    },
    onShow: () => {
      SendClientSideEvent(atmosphere, 'Snackbar Viewed', {
        snackbarType
      })
    },
    onManualDismiss: () => {
      SendClientSideEvent(atmosphere, 'Snackbar Clicked', {
        snackbarType
      })
    }
  }
}

export default mapMentionedToToast
