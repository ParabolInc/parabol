import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import NotificationAction from '~/components/NotificationAction'
import {ResponseReplied_notification$key} from '../__generated__/ResponseReplied_notification.graphql'
import useRouter from '../hooks/useRouter'
import {useTipTapCommentEditor} from '../hooks/useTipTapCommentEditor'
import anonymousAvatar from '../styles/theme/images/anonymous-avatar.svg'
import NotificationTemplate from './NotificationTemplate'
import {TipTapEditor} from './promptResponse/TipTapEditor'

interface Props {
  notification: ResponseReplied_notification$key
}

const ResponseReplied = (props: Props) => {
  const {notification: notificationRef} = props
  const notification = useFragment(
    graphql`
      fragment ResponseReplied_notification on NotifyResponseReplied {
        ...NotificationTemplate_notification
        author {
          picture
          preferredName
        }
        response {
          id
        }
        meeting {
          id
          name
        }
        comment {
          content
        }
      }
    `,
    notificationRef
  )
  const {history} = useRouter()
  const {meeting, author, comment, response} = notification
  const authorPicture = author ? author.picture : anonymousAvatar
  const authorName = author ? author.preferredName : 'Anonymous'

  const {id: meetingId, name: meetingName} = meeting
  const goThere = () => {
    history.push(`/meet/${meetingId}/responses?responseId=${encodeURIComponent(response.id)}`)
  }

  const {editor} = useTipTapCommentEditor(comment.content, {
    readOnly: true
  })
  if (!editor) return null

  return (
    <NotificationTemplate
      avatar={authorPicture}
      message={`${authorName} replied to your response in ${meetingName}.`}
      notification={notification}
      action={<NotificationAction label={'See the discussion'} onClick={goThere} />}
    >
      <div className='my-1 rounded-sm bg-white p-2 text-sm leading-5 shadow-card'>
        <TipTapEditor editor={editor} />
      </div>
    </NotificationTemplate>
  )
}

export default ResponseReplied
