import graphql from 'babel-plugin-relay/macro'
import {Snack} from '../../components/Snackbar'
import {OnNextHistoryContext} from '../../types/relayMutations'
import {mapResponseMentionedToToast_notification$data} from '../../__generated__/mapResponseMentionedToToast_notification.graphql'
import makeNotificationToastKey from './makeNotificationToastKey'

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
  }
`

const mapResponseMentionedToToast = (
  notification: mapResponseMentionedToToast_notification$data,
  {history}: OnNextHistoryContext
): Snack | null => {
  if (!notification) return null
  const {id: notificationId, meeting, response} = notification
  const {preferredName: authorName} = response.user
  const {id: meetingId, name: meetingName} = meeting

  // :TODO: (jmtaber129): Check if we're already open to the relevant standup response discussion
  // thread, and do nothing if we are.

  return {
    key: makeNotificationToastKey(notificationId),
    autoDismiss: 10,
    message: `${authorName} mentioned you in their response in ${meetingName}.`,
    action: {
      label: 'See their response',
      callback: () => {
        history.push(`/meet/${meetingId}/responses?responseId=${encodeURIComponent(response.id)}`)
      }
    }
  }
}

export default mapResponseMentionedToToast
