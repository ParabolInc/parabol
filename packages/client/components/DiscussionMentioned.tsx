import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import NotificationAction from '~/components/NotificationAction'
import {DiscussionMentioned_notification$key} from '../__generated__/DiscussionMentioned_notification.graphql'
import useRouter from '../hooks/useRouter'
import {useTipTapCommentEditor} from '../hooks/useTipTapCommentEditor'
import anonymousAvatar from '../styles/theme/images/anonymous-avatar.svg'
import fromStageIdToUrl from '../utils/meetings/fromStageIdToUrl'
import NotificationTemplate from './NotificationTemplate'
import {TipTapEditor} from './promptResponse/TipTapEditor'

interface Props {
  notification: DiscussionMentioned_notification$key
}

const DiscussionMentioned = (props: Props) => {
  const {notification: notificationRef} = props
  const notification = useFragment(
    graphql`
      fragment DiscussionMentioned_notification on NotifyDiscussionMentioned {
        ...NotificationTemplate_notification
        author {
          picture
          preferredName
        }
        meeting {
          id
          name
          ...fromStageIdToUrl_meeting
        }
        comment {
          content
        }
        discussion {
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
    `,
    notificationRef
  )
  const {history} = useRouter()
  const {meeting, author, comment, discussion} = notification
  const authorPicture = author ? author.picture : anonymousAvatar
  const authorName = author ? author.preferredName : 'Anonymous'
  const {stage} = discussion
  const {id: stageId, response} = stage ?? {}
  const {id: meetingId, name: meetingName} = meeting

  const directUrl = stageId ? fromStageIdToUrl(stageId, meeting) : `/meet/${meetingId}`

  const goThere = () => {
    history.push(
      response ? `${directUrl}?responseId=${encodeURIComponent(response.id)}` : directUrl
    )
  }

  const {editor} = useTipTapCommentEditor(comment.content, {
    readOnly: true
  })
  if (!editor) return null
  return (
    <NotificationTemplate
      avatar={authorPicture}
      message={`${authorName} mentioned you in a discussion in ${meetingName}.`}
      notification={notification}
      action={<NotificationAction label={'See the discussion'} onClick={goThere} />}
    >
      <div className='my-1 rounded-sm bg-white p-2 text-sm leading-5 shadow-card'>
        <TipTapEditor editor={editor} />
      </div>
    </NotificationTemplate>
  )
}

export default DiscussionMentioned
