import {generateHTML} from '@tiptap/core'
import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {useFragment} from 'react-relay'
import NotificationAction from '~/components/NotificationAction'
import useAtmosphere from '~/hooks/useAtmosphere'
import anonymousAvatar from '~/styles/theme/images/anonymous-avatar.svg'
import {Mentioned_notification$key} from '../__generated__/Mentioned_notification.graphql'
import useRouter from '../hooks/useRouter'
import {serverTipTapExtensions} from '../shared/tiptap/serverTipTapExtensions'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import NotificationTemplate from './NotificationTemplate'

interface Props {
  notification: Mentioned_notification$key
}

const Mentioned = (props: Props) => {
  const {notification: notificationRef} = props
  const notification = useFragment(
    graphql`
      fragment Mentioned_notification on NotifyMentioned {
        ...NotificationTemplate_notification
        type
        status
        senderName
        senderPicture
        createdAt
        meetingId
        meetingName
        retroReflection {
          content
        }
        retroDiscussStageIdx
      }
    `,
    notificationRef
  )
  const {history} = useRouter()
  const atmosphere = useAtmosphere()

  const {
    senderName,
    senderPicture,
    meetingId,
    meetingName,
    type,
    status,
    retroReflection,
    retroDiscussStageIdx
  } = notification

  const isAnonymous = !senderName
  const authorName = isAnonymous ? 'Someone' : senderName

  useEffect(() => {
    SendClientSideEvent(atmosphere, 'Notification Viewed', {
      notificationType: type,
      notificationStatus: status
    })
  }, [])

  let locationType = 'their response'
  let actionLabel = 'See their response'
  let actionUrl = `/meet/${meetingId}`
  let previewContent = null

  if (retroReflection) {
    actionLabel = 'See their reflection'
    locationType = 'their reflection'
    previewContent = retroReflection.content
    if (retroDiscussStageIdx) {
      actionUrl = `/meet/${meetingId}/discuss/${retroDiscussStageIdx}`
    }
  }

  const message = `${authorName} mentioned you in ${locationType} in ${meetingName}`

  const goThere = () => {
    history.push(actionUrl)
  }

  const htmlContent = previewContent
    ? generateHTML(JSON.parse(previewContent), serverTipTapExtensions)
    : ''

  return (
    <NotificationTemplate
      avatar={!isAnonymous ? senderPicture : anonymousAvatar}
      message={message}
      notification={notification}
      action={<NotificationAction label={actionLabel} onClick={goThere} />}
    >
      {previewContent && (
        <div className='mx-0 my-1 mt-4 rounded-sm bg-white p-2 text-sm leading-5 shadow-card'>
          <div dangerouslySetInnerHTML={{__html: htmlContent}}></div>
        </div>
      )}
    </NotificationTemplate>
  )
}

export default Mentioned
