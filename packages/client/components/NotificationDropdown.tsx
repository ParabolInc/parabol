import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject} from 'react'
import {useTranslation} from 'react-i18next'
import {usePaginationFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useTimeout from '~/hooks/useTimeout'
import SetNotificationStatusMutation from '~/mutations/SetNotificationStatusMutation'
import {
  NotificationDropdown_query,
  NotificationDropdown_query$key
} from '~/__generated__/NotificationDropdown_query.graphql'
import useLoadNextOnScrollBottom from '../hooks/useLoadNextOnScrollBottom'
import {MenuProps} from '../hooks/useMenu'
import useSegmentTrack from '../hooks/useSegmentTrack'
import {NotificationDropdownPaginationQuery} from '../__generated__/NotificationDropdownPaginationQuery.graphql'
import Menu from './Menu'
import MenuItem from './MenuItem'
import NotificationPicker from './NotificationPicker'

interface Props {
  menuProps: MenuProps
  parentRef: RefObject<HTMLDivElement>
  queryRef: NotificationDropdown_query$key
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

const defaultViewer = {notifications: {edges: []}} as unknown as NotificationDropdown_query

const NotificationDropdown = (props: Props) => {
  const {queryRef, menuProps, parentRef} = props

  //FIXME i18n: Notification Menu Opened
  const {t} = useTranslation()

  const paginationRes = usePaginationFragment<
    NotificationDropdownPaginationQuery,
    NotificationDropdown_query$key
  >(
    graphql`
      fragment NotificationDropdown_query on Query
      @refetchable(queryName: "NotificationDropdownPaginationQuery") {
        viewer {
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
      }
    `,
    queryRef
  )
  const {data} = paginationRes
  const {viewer} = data
  const {notifications} = viewer || defaultViewer
  const {edges} = notifications
  const hasNotifications = edges.length > 0
  const timeOut = useTimeout(300)
  const lastItem = useLoadNextOnScrollBottom(paginationRes, {
    root: parentRef.current,
    rootMargin: '8px'
  })
  const atmosphere = useAtmosphere()
  useSegmentTrack('Notification Menu Opened', {})
  return (
    <Menu ariaLabel={t('NotificationDropdown.SelectANotification')} {...menuProps}>
      {!hasNotifications && (
        <MenuItem
          label={<NoNotifications>{t('NotificationDropdown.YouReAllCaughtUp')}</NoNotifications>}
        />
      )}
      {edges.map(({node}) => {
        const {id: notificationId, status} = node
        const onViewFn = () => {
          SetNotificationStatusMutation(atmosphere, {notificationId, status: 'READ'}, {})
        }
        const onClickFn = () => {
          SetNotificationStatusMutation(atmosphere, {notificationId, status: 'CLICKED'}, {})
        }
        const onView = status === 'UNREAD' ? onViewFn : undefined
        return (
          <MenuItem
            key={node.id}
            onView={onView}
            onClick={onClickFn}
            parentRef={parentRef}
            label={<NotificationPicker notification={node} />}
          />
        )
      })}
      {hasNotifications && timeOut && (
        <MenuItem key={t('NotificationDropdown.Last')} label={lastItem} />
      )}
    </Menu>
  )
}

export default NotificationDropdown
