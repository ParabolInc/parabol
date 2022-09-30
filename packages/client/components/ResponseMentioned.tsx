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
  const {history} = useRouter()
  const {meeting, response} = notification
  const {picture: authorPicture, preferredName: authorName} = response.user

  const {id: meetingId, name: meetingName} = meeting
  const goThere = () => {
    // :TODO: (jmtaber129): Link directly to card once we support that.
    history.push(`/meet/${meetingId}`)
  }

  // :TODO: (jmtaber129): Show mention preview.
  return (
    <NotificationTemplate
      avatar={authorPicture}
      message={`${authorName} mentioned you in their response in ${meetingName}.`}
      notification={notification}
      action={<NotificationAction label={'See their response'} onClick={goThere} />}
    />
  )
}

export default ResponseMentioned
