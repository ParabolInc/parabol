import graphql from 'babel-plugin-relay/macro'
import {mapDiscussionMentionedToToast_notification$data} from '../../__generated__/mapDiscussionMentionedToToast_notification.graphql'
import {Snack} from '../../components/Snackbar'
import {OnNextHistoryContext} from '../../types/relayMutations'
import findStageById from '../../utils/meetings/findStageById'
import fromStageIdToUrl from '../../utils/meetings/fromStageIdToUrl'
import getMeetingPathParams from '../../utils/meetings/getMeetingPathParams'
import makeNotificationToastKey from './makeNotificationToastKey'

graphql`
  fragment mapDiscussionMentionedToToast_notification on NotifyDiscussionMentioned {
    id
    author {
      id
      preferredName
    }
    meeting {
      id
      name
      phases {
        phaseType
        stages {
          id
        }
      }
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
  notification: mapDiscussionMentionedToToast_notification$data,
  {history}: OnNextHistoryContext
): Snack | null => {
  if (!notification) return null
  const {id: notificationId, meeting, author, discussion} = notification
  const authorName = author ? author.preferredName : 'Anonymous'
  const {id: meetingId, name: meetingName} = meeting
  const {stage} = discussion
  const {id: stageId, response} = stage ?? {}

  const meetingPath = getMeetingPathParams()
  const notifStageRes = findStageById(meeting.phases, stageId)
  if (
    meetingPath.meetingId === meetingId &&
    (!stageId ||
      (notifStageRes?.stageIdx === meetingPath.stageIdx &&
        notifStageRes?.phase.phaseType === meetingPath.phaseType))
  ) {
    // We're already in the relevant stage of the meeting, so don't pop toast.
    return null
  }

  const directUrl = stageId ? fromStageIdToUrl(stageId, meeting) : `/meet/${meetingId}`

  return {
    key: makeNotificationToastKey(notificationId),
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
