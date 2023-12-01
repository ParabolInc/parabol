import graphql from 'babel-plugin-relay/macro'
import {Snack} from '../../components/Snackbar'
import {OnNextHistoryContext} from '../../types/relayMutations'
import {mapResponseMentionedToToast_notification$data} from '../../__generated__/mapResponseMentionedToToast_notification.graphql'
import makeNotificationToastKey from './makeNotificationToastKey'
import getReactji from '../../utils/getReactji'

graphql`
  fragment mapResponseMentionedToToast_notification on NotifyResponseMentioned {
    id
    response {
      id
      user {
        preferredName
      }
    }
    meeting {
      id
      name
    }
    kudosEmoji
  }
`

const mapResponseMentionedToToast = (
  notification: mapResponseMentionedToToast_notification$data,
  {history}: OnNextHistoryContext
): Snack | null => {
  if (!notification) return null
  const {id: notificationId, meeting, response, kudosEmoji} = notification
  const {preferredName: authorName} = response.user
  const {id: meetingId, name: meetingName} = meeting

  const unicodeEmoji = kudosEmoji ? getReactji(kudosEmoji).unicode : ''

  const message = kudosEmoji
    ? `${unicodeEmoji} ${authorName} mentioned you and gave kudos in their response in ${meetingName}.`
    : `${authorName} mentioned you in their response in ${meetingName}.`

  // :TODO: (jmtaber129): Check if we're already open to the relevant standup response discussion
  // thread, and do nothing if we are.

  return {
    key: makeNotificationToastKey(notificationId),
    autoDismiss: 10,
    message,
    action: {
      label: 'See their response',
      callback: () => {
        history.push(`/meet/${meetingId}/responses?responseId=${encodeURIComponent(response.id)}`)
      }
    }
  }
}

export default mapResponseMentionedToToast
