import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import NotificationRow from 'modules/notifications/components/NotificationRow/NotificationRow'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {MenuProps} from '../hooks/useMenu'
import Menu from './Menu'
import MenuItem from './MenuItem'
import {NotificationDropdown_viewer} from '__generated__/NotificationDropdown_viewer.graphql'

interface Props {
  menuProps: MenuProps
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

const NotificationDropdown = (props: Props) => {
  const {viewer, menuProps} = props
  const {notifications} = viewer || {notifications: {edges: []}}
  const {edges} = notifications
  const hasNotifications = edges.length > 0
  return (
    <Menu ariaLabel={'Select a notification'} {...menuProps}>
      {!hasNotifications && (
        <MenuItem label={<NoNotifications>{'You’re all caught up! 💯'}</NoNotifications>} />
      )}
      {edges.map(({node}) => {
        return <MenuItem key={node.id} label={<NotificationRow notification={node} />} />
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
            ...NotificationRow_notification
          }
        }
      }
      id
    }
  `
})
