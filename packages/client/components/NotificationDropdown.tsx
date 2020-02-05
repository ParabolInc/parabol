import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import useLoadMoreOnScrollBottom from 'hooks/useLoadMoreOnScrollBottom'
import useTimeout from 'hooks/useTimeout'
import NotificationPicker from 'modules/notifications/components/NotificationRow/NotificationPicker'
import React, {RefObject} from 'react'
import {createPaginationContainer, RelayPaginationProp} from 'react-relay'
import {NotificationStatusEnum} from 'types/graphql'
import {NotificationDropdown_viewer} from '__generated__/NotificationDropdown_viewer.graphql'
import {MenuProps} from '../hooks/useMenu'
import Menu from './Menu'
import MenuItem from './MenuItem'
import SetNotificationStatusMutation from 'mutations/SetNotificationStatusMutation'
import useAtmosphere from 'hooks/useAtmosphere'

interface Props {
  menuProps: MenuProps
  parentRef: RefObject<HTMLDivElement>
  relay: RelayPaginationProp
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
  const {viewer, menuProps, parentRef, relay} = props
  const {notifications} = viewer || defaultViewer
  const {edges} = notifications
  const hasNotifications = edges.length > 0
  const timeOut = useTimeout(300)
  const lastItem = useLoadMoreOnScrollBottom(relay)
  const atmosphere = useAtmosphere()
  return (
    <Menu ariaLabel={'Select a notification'} {...menuProps}>
      {!hasNotifications && (
        <MenuItem label={<NoNotifications>{'You’re all caught up! 💯'}</NoNotifications>} />
      )}
      {edges.map(({node}) => {
        const {id: notificationId, status} = node
        const onViewFn = () => {
          SetNotificationStatusMutation(
            atmosphere,
            {notificationId, status: NotificationStatusEnum.READ},
            {}
          )
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
      {hasNotifications && timeOut && <MenuItem key={'last'} label={lastItem} />}
    </Menu>
  )
}

export default createPaginationContainer(
  NotificationDropdown,
  {
    viewer: graphql`
      fragment NotificationDropdown_viewer on User {
        notifications(first: $first, after: $after)
          @connection(key: "NotificationDropdown_notifications") {
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
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      const {viewer} = props
      return viewer?.notifications
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount
      }
    },
    getVariables(_props, {count, cursor}, fragmentVariables) {
      return {
        ...fragmentVariables,
        first: count,
        after: cursor
      }
    },
    query: graphql`
      query NotificationDropdownPaginationQuery($first: Int!, $after: DateTime) {
        viewer {
          ...NotificationDropdown_viewer
        }
      }
    `
  }
)
