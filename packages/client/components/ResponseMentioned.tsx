import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {useFragment} from 'react-relay'
import NotificationAction from '~/components/NotificationAction'
import useRouter from '../hooks/useRouter'
import {ResponseMentioned_notification$key} from '../__generated__/ResponseMentioned_notification.graphql'
import NotificationTemplate from './NotificationTemplate'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import useAtmosphere from '~/hooks/useAtmosphere'

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
        type
        status
        kudosEmojiUnicode
      }
    `,
    notificationRef
  )
  const {history} = useRouter()
  const atmosphere = useAtmosphere()
  const {meeting, response, kudosEmojiUnicode, type, status} = notification
  const {picture: authorPicture, preferredName: authorName} = response.user

  useEffect(() => {
    SendClientSideEvent(atmosphere, 'Notification Viewed', {
      notificationType: type,
      notificationStatus: status,
      kudosEmojiUnicode
    })
  }, [])

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
