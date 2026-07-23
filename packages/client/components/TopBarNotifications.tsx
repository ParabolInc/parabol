import graphql from 'babel-plugin-relay/macro'
import {Suspense, useEffect, useState} from 'react'
import {useFragment} from 'react-relay'
import {useLocation} from 'react-router'
import type {TopBarNotifications_query$key} from '~/__generated__/TopBarNotifications_query.graphql'
import lazyPreload from '~/utils/lazyPreload'
import {Menu} from '../ui/Menu/Menu'
import TopBarIcon from './TopBarIcon'

const NotificationDropdown = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'NotificationDropdown' */
      './NotificationDropdown'
    )
)

interface Props {
  queryRef: TopBarNotifications_query$key
}

const TopBarNotifications = ({queryRef}: Props) => {
  const data = useFragment(
    graphql`
      fragment TopBarNotifications_query on Query {
        ...NotificationDropdown_query
        viewer {
          notifications(first: $first, after: $after)
            @connection(key: "NotificationDropdown_notifications") {
            edges {
              node {
                id
                status
              }
            }
          }
        }
      }
    `,
    queryRef
  )
  const {viewer} = data
  const notifications = viewer?.notifications || {edges: []}
  const {edges} = notifications
  const hasNotifications = edges.some(({node}) => node.status === 'UNREAD')
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  useEffect(() => {
    const parsed = new URLSearchParams(location.search)
    if (parsed.get('openNotifs')) {
      // delay a bit so the menu catches the user's attention by opening shortly
      // after the rest of the page loads
      setTimeout(() => setIsOpen(true), 500)
    }
  }, [])

  return (
    <Menu
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <TopBarIcon
          onMouseEnter={NotificationDropdown.preload}
          icon={'notifications'}
          hasBadge={hasNotifications}
          ariaLabel={'Notifications'}
        />
      }
    >
      <Suspense fallback={null}>
        <NotificationDropdown queryRef={data} />
      </Suspense>
    </Menu>
  )
}

export default TopBarNotifications
