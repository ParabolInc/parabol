import graphql from 'babel-plugin-relay/macro'
import NotificationSubtitle from 'components/NotificationSubtitle'
import React, {ReactNode} from 'react'
import {createFragmentContainer} from 'react-relay'
import {NotificationStatusEnum} from 'types/graphql'
import {NotificationTemplate_notification} from '__generated__/NotificationTemplate_notification.graphql'
import NotificationRow from './NotificationRow'
import NotificationBody from './NotificationBody'
import NotificationMessage from './NotificationMessage'
import parabolLogo from '../../../static/images/brand/mark-color.svg'
import useRefreshInterval from 'hooks/useRefreshInterval'
import ms from 'ms'

interface Props {
  avatar?: string
  message: string
  notification: NotificationTemplate_notification
  action?: ReactNode
  children?: ReactNode
}

const NotificationTemplate = (props: Props) => {
  const {avatar, message, notification, action, children} = props
  const {createdAt, status} = notification
  // keep the timestamp fresh
  useRefreshInterval(ms('1m'))
  return (
    <NotificationRow
      avatar={avatar || parabolLogo}
      isParabol={!avatar}
      status={(status as unknown) as NotificationStatusEnum}
    >
      <NotificationBody>
        <NotificationMessage>{message}</NotificationMessage>
        <NotificationSubtitle timestamp={createdAt}>{action}</NotificationSubtitle>
        {children}
      </NotificationBody>
    </NotificationRow>
  )
}

export default createFragmentContainer(NotificationTemplate, {
  notification: graphql`
    fragment NotificationTemplate_notification on Notification {
      createdAt
      status
    }
  `
})
