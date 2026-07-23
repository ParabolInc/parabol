import graphql from 'babel-plugin-relay/macro'
import {usePaginationFragment} from 'react-relay'
import type {
  NotificationDropdown_query$data,
  NotificationDropdown_query$key
} from '~/__generated__/NotificationDropdown_query.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import useTimeout from '~/hooks/useTimeout'
import SetNotificationStatusMutation from '~/mutations/SetNotificationStatusMutation'
import type {NotificationDropdownPaginationQuery} from '../__generated__/NotificationDropdownPaginationQuery.graphql'
import useClientSideTrack from '../hooks/useClientSideTrack'
import useLoadNextOnScrollBottom from '../hooks/useLoadNextOnScrollBottom'
import {MenuContent} from '../ui/Menu/MenuContent'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import NotificationMenuItem from './NotificationMenuItem'
import NotificationPicker from './NotificationPicker'

interface Props {
  queryRef: NotificationDropdown_query$key
}

const defaultViewer = {
  notifications: {edges: []}
} as unknown as NotificationDropdown_query$data

const NotificationDropdown = (props: Props) => {
  const {queryRef} = props
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
                type
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
  // the sentinel is inside the scrolling MenuContent, so the viewport root already
  // clips it to what is visible in the menu
  const lastItem = useLoadNextOnScrollBottom(paginationRes, {rootMargin: '8px'})
  const atmosphere = useAtmosphere()
  useClientSideTrack('Notification Menu Opened', {})
  return (
    <MenuContent
      align='end'
      sideOffset={4}
      aria-label='Select a notification'
      className='max-h-96 w-100 max-w-[calc(100vw-16px)]'
    >
      {!hasNotifications && (
        <div className='flex h-14 w-full items-center justify-center px-4 font-semibold text-base'>
          {'You’re all caught up! 💯'}
        </div>
      )}
      {edges.map(({node}) => {
        const {id: notificationId, status, type} = node
        const onViewFn = () => {
          SetNotificationStatusMutation(atmosphere, {notificationId, status: 'READ'}, {})
        }
        const onClickFn = () => {
          SetNotificationStatusMutation(atmosphere, {notificationId, status: 'CLICKED'}, {})
          SendClientSideEvent(atmosphere, 'Notification Clicked', {
            notificationType: type
          })
        }
        const onView = status === 'UNREAD' ? onViewFn : undefined
        return (
          <NotificationMenuItem key={node.id} onView={onView} onClick={onClickFn}>
            <NotificationPicker notification={node} />
          </NotificationMenuItem>
        )
      })}
      {hasNotifications && timeOut && lastItem}
    </MenuContent>
  )
}

export default NotificationDropdown
