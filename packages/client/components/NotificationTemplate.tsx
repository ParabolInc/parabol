import graphql from 'babel-plugin-relay/macro'
import ms from 'ms'
import React, {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import parabolLogo from 'static/images/brand/mark-color.svg'
import NotificationSubtitle from '~/components/NotificationSubtitle'
import useRefreshInterval from '~/hooks/useRefreshInterval'
import {NotificationTemplate_notification$key} from '~/__generated__/NotificationTemplate_notification.graphql'
import NotificationBody from './NotificationBody'
import NotificationMessage from './NotificationMessage'
import NotificationRow from './NotificationRow'

interface Props {
  avatar?: string
  message: string
  notification: NotificationTemplate_notification$key
  action?: ReactNode
  children?: ReactNode
}

const NotificationTemplate = (props: Props) => {
  const {avatar, message, notification: notificationRef, action, children} = props
  const notification = useFragment(
    graphql`
      fragment NotificationTemplate_notification on Notification {
        createdAt
        status
      }
    `,
    notificationRef
  )
  const {createdAt, status} = notification
  // keep the timestamp fresh
  useRefreshInterval(ms('1m'))
  return (
    <NotificationRow avatar={avatar || parabolLogo} isParabol={!avatar} status={status}>
      <NotificationBody>
        <NotificationMessage>{message}</NotificationMessage>
        <NotificationSubtitle timestamp={createdAt}>{action}</NotificationSubtitle>
        {children}
      </NotificationBody>
    </NotificationRow>
  )
}

export default NotificationTemplate
