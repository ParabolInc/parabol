import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import NotificationAction from '~/components/NotificationAction'
import type {ResponseMentioned_notification$key} from '../__generated__/ResponseMentioned_notification.graphql'
import NotificationTemplate from './NotificationTemplate'

interface Props {
  notification: ResponseMentioned_notification$key
}

const ResponseMentioned = (props: Props) => {
  const {notification: notificationRef} = props
  const notification = useFragment(
    graphql`
      fragment ResponseMentioned_notification on NotifyResponseMentioned {
        ...NotificationTemplate_notification
        response {
          id
          user {
            picture
            preferredName
          }
        }
        meeting {
          id
          name
        }
      }
    `,
    notificationRef
  )
  const navigate = useNavigate()
  const {meeting, response} = notification
  const {picture: authorPicture, preferredName: authorName} = response.user

  const {id: meetingId, name: meetingName} = meeting
  const goThere = () => {
    navigate(`/meet/${meetingId}/responses?responseId=${encodeURIComponent(response.id)}`)
  }

  const message = `${authorName} mentioned you in their response in ${meetingName}.`

  // :TODO: (jmtaber129): Show mention preview.
  return (
    <NotificationTemplate
      avatar={authorPicture}
      message={message}
      notification={notification}
      action={<NotificationAction label={'See their response'} onClick={goThere} />}
    />
  )
}

export default ResponseMentioned
