import graphql from 'babel-plugin-relay/macro'
import {Snack} from '../../components/Snackbar'
import {OnNextHistoryContext} from '../../types/relayMutations'
import {mapMentionedToToast_notification$data} from '../../__generated__/mapMentionedToToast_notification.graphql'
import SendClientSideEvent from '../../utils/SendClientSideEvent'
import makeNotificationToastKey from './makeNotificationToastKey'

graphql`
  fragment mapMentionedToToast_notification on NotifyMentioned {
    id
    kudosEmojiUnicode
    name
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
    name,
    meetingName,
    kudosEmojiUnicode,
    retroReflection,
    retroDiscussStageIdx,
    meetingId
  } = notification
  const isAnonymous = !name
  const authorName = isAnonymous ? 'Someone' : name

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

  const message = !kudosEmojiUnicode
    ? `${authorName} mentioned you in ${locationType} in ${meetingName}`
    : `${kudosEmojiUnicode} ${authorName} gave you kudos in ${locationType} in ${meetingName}`

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
        snackbarType,
        kudosEmojiUnicode
      })
    },
    onManualDismiss: () => {
      SendClientSideEvent(atmosphere, 'Snackbar Clicked', {
        snackbarType,
        kudosEmojiUnicode
      })
    }
  }
}

export default mapMentionedToToast
