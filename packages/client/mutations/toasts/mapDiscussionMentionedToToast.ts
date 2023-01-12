import graphql from 'babel-plugin-relay/macro'
import {Snack} from '../../components/Snackbar'
import {OnNextHistoryContext} from '../../types/relayMutations'
import fromStageIdToUrl from '../../utils/meetings/fromStageIdToUrl'
import {mapDiscussionMentionedToToast_notification} from '../../__generated__/mapDiscussionMentionedToToast_notification.graphql'

graphql`
  fragment mapDiscussionMentionedToToast_notification on NotifyDiscussionMentioned {
    author {
      id
      preferredName
    }
    meeting {
      id
      name
      facilitatorStageId
      ...fromStageIdToUrl_meeting
    }
    discussion {
      id
      stage {
        __typename
        id
        ... on TeamPromptResponseStage {
          response {
            id
          }
        }
      }
    }
  }
`

const mapDiscussionMentionedToToast = (
  notification: mapDiscussionMentionedToToast_notification,
  {history}: OnNextHistoryContext
): Snack | null => {
  if (!notification) return null
  const {meeting, author, discussion} = notification
  const {preferredName: authorName} = author
  const {id: meetingId, name: meetingName, facilitatorStageId} = meeting
  const {stage} = discussion
  const {id: stageId, response} = stage ?? {}

  const directUrl = stageId
    ? fromStageIdToUrl(stageId, meeting, facilitatorStageId)
    : `/meet/${meetingId}`

  // :TODO: (jmtaber129): Check if we're already open to the relevant standup response discussion
  // thread, and do nothing if we are.

  return {
    key: `discussionMentioned:${discussion.id}:${author.id}`,
    autoDismiss: 10,
    message: `${authorName} mentioned you in a discussion in ${meetingName}.`,
    action: {
      label: 'See the discussion',
      callback: () => {
        history.push(
          response ? `${directUrl}?responseId=${encodeURIComponent(response.id)}` : directUrl
        )
      }
    }
  }
}

export default mapDiscussionMentionedToToast
