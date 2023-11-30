import graphql from 'babel-plugin-relay/macro'
import {Link} from 'react-router-dom'
import React, {useEffect} from 'react'
import {useFragment} from 'react-relay'
import {KudosReceivedNotification_notification$key} from '~/__generated__/KudosReceivedNotification_notification.graphql'
import NotificationTemplate from './NotificationTemplate'
import useAtmosphere from '../hooks/useAtmosphere'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import getReactji from '~/utils/getReactji'

interface Props {
  notification: KudosReceivedNotification_notification$key
}

const KudosReceivedNotification = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {notification: notificationRef} = props
  const notification = useFragment(
    graphql`
      fragment KudosReceivedNotification_notification on NotifyKudosReceived {
        ...NotificationTemplate_notification
        id
        type
        name
        picture
        meetingName
        meetingId
        emoji
        status
      }
    `,
    notificationRef
  )
  const {type, name, picture, meetingName, emoji, meetingId, status} = notification

  const {unicode} = getReactji(emoji)

  useEffect(() => {
    SendClientSideEvent(atmosphere, 'Notification Viewed', {
      notificationType: type,
      notificationStatus: status
    })
  }, [])

  return (
    <NotificationTemplate
      message={
        <>
          {unicode} {name} gave you kudos in{' '}
          <Link to={`/meet/${meetingId}`} className='font-semibold text-sky-500 underline'>
            {meetingName}
          </Link>
        </>
      }
      notification={notification}
      avatar={picture}
    />
  )
}

export default KudosReceivedNotification
