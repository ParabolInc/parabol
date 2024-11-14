import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {useFragment} from 'react-relay'
import NotificationAction from '~/components/NotificationAction'
import useAtmosphere from '~/hooks/useAtmosphere'
import {ResponseMentioned_notification$key} from '../__generated__/ResponseMentioned_notification.graphql'
import useRouter from '../hooks/useRouter'
import SendClientSideEvent from '../utils/SendClientSideEvent'
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
        type
        status
      }
    `,
    notificationRef
  )
  const {history} = useRouter()
  const atmosphere = useAtmosphere()
  const {meeting, response, type, status} = notification
  const {picture: authorPicture, preferredName: authorName} = response.user

  useEffect(() => {
    SendClientSideEvent(atmosphere, 'Notification Viewed', {
      notificationType: type,
      notificationStatus: status
    })
  }, [])

  const {id: meetingId, name: meetingName} = meeting
  const goThere = () => {
    history.push(`/meet/${meetingId}/responses?responseId=${encodeURIComponent(response.id)}`)
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
