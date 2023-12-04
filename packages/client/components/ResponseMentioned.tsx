import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import NotificationAction from '~/components/NotificationAction'
import useRouter from '../hooks/useRouter'
import {ResponseMentioned_notification$key} from '../__generated__/ResponseMentioned_notification.graphql'
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
        kudosEmojiUnicode
      }
    `,
    notificationRef
  )
  const {history} = useRouter()
  const {meeting, response, kudosEmojiUnicode} = notification
  const {picture: authorPicture, preferredName: authorName} = response.user

  const {id: meetingId, name: meetingName} = meeting
  const goThere = () => {
    history.push(`/meet/${meetingId}/responses?responseId=${encodeURIComponent(response.id)}`)
  }

  const message = kudosEmojiUnicode
    ? `${kudosEmojiUnicode} ${authorName} mentioned you and gave kudos in their response in ${meetingName}.`
    : `${authorName} mentioned you in their response in ${meetingName}.`

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
