import graphql from 'babel-plugin-relay/macro'
import {Snack} from '../../components/Snackbar'
import {OnNextHistoryContext} from '../../types/relayMutations'
import {mapResponseRepliedToToast_notification} from '../../__generated__/mapResponseRepliedToToast_notification.graphql'

graphql`
  fragment mapResponseRepliedToToast_notification on NotifyResponseReplied {
    author {
      id
      preferredName
    }
    response {
      id
    }
    meeting {
      id
      name
    }
  }
`

const mapResponseRepliedToToast = (
  notification: mapResponseRepliedToToast_notification,
  {history}: OnNextHistoryContext
): Snack | null => {
  if (!notification) return null
  const {meeting, author, response} = notification
  const {preferredName: authorName} = author
  const {id: meetingId, name: meetingName} = meeting

  return {
    key: `responseReplied:${response.id}:${author.id}`,
    autoDismiss: 10,
    message: `${authorName} replied to your response in ${meetingName}.`,
    action: {
      label: 'See the discussion',
      callback: () => {
        history.push(`/meet/${meetingId}/responses?responseId=${encodeURIComponent(response.id)}`)
      }
    }
  }
}

export default mapResponseRepliedToToast
