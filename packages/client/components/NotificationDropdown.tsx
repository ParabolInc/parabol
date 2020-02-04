import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import NotificationPicker from 'modules/notifications/components/NotificationRow/NotificationPicker'
import React, {RefObject} from 'react'
import {createFragmentContainer} from 'react-relay'
import {NotificationStatusEnum} from 'types/graphql'
import {NotificationDropdown_viewer} from '__generated__/NotificationDropdown_viewer.graphql'
import {MenuProps} from '../hooks/useMenu'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface Props {
  menuProps: MenuProps
  parentRef: RefObject<HTMLDivElement>
  viewer: NotificationDropdown_viewer | null
}

const NoNotifications = styled('div')({
  alignItems: 'center',
  display: 'flex',
  fontSize: 16,
  fontWeight: 600,
  height: 56,
  justifyContent: 'center',
  padding: '0 16px',
  width: '100%'
})

const defaultViewer = ({notifications: {edges: []}} as unknown) as NotificationDropdown_viewer

const NotificationDropdown = (props: Props) => {
  const {viewer, menuProps, parentRef} = props
  const {notifications} = viewer || defaultViewer
  const {edges} = notifications
  const hasNotifications = edges.length > 0
  return (
    <Menu ariaLabel={'Select a notification'} {...menuProps}>
      {!hasNotifications && (
        <MenuItem label={<NoNotifications>{'You’re all caught up! 💯'}</NoNotifications>} />
      )}
      {edges.map(({node}) => {
        const {id: notificationId, status} = node
        const onViewFn = () => {
          console.log('viewable', notificationId)
        }

        const onView = status === NotificationStatusEnum.UNREAD ? onViewFn : undefined
        return (
          <MenuItem
            key={node.id}
            onView={onView}
            parentRef={parentRef}
            label={<NotificationPicker notification={node} />}
          />
        )
      })}
    </Menu>
  )
}

export default createFragmentContainer(NotificationDropdown, {
  viewer: graphql`
    fragment NotificationDropdown_viewer on User {
      notifications(first: 100) @connection(key: "NotificationDropdown_notifications") {
        edges {
          node {
            id
            status
            ...NotificationPicker_notification
          }
        }
      }
      id
    }
  `
})
