import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useRef} from 'react'
import {useFragment} from 'react-relay'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import lazyPreload from '~/utils/lazyPreload'
import {TopBarNotifications_query$key} from '~/__generated__/TopBarNotifications_query.graphql'
import useRouter from '../hooks/useRouter'
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
  const menuContentRef = useRef<HTMLDivElement>(null)
  const {togglePortal, openPortal, originRef, menuPortal, menuProps} = useMenu<HTMLDivElement>(
    MenuPosition.UPPER_RIGHT,
    {menuContentRef, id: 'topBarNotificationsMenu'}
  )
  const {location} = useRouter()
  useEffect(() => {
    const parsed = new URLSearchParams(location.search)
    if (parsed.get('openNotifs')) {
      // :HACK: Opening the portal immediately sometimes leads to rendering just off the left side
      // of the window, so delay a bit before opening. This might be benefial regardless, as it
      // catches the user's attention when it opens shortly after the rest of the page loads.
      setTimeout(openPortal, 500)
    }
  }, [])

  return (
    <>
      <TopBarIcon
        ref={originRef}
        onClick={togglePortal}
        onMouseEnter={NotificationDropdown.preload}
        icon={'notifications'}
        hasBadge={hasNotifications}
        ariaLabel={'Notifications'}
      />
      {menuPortal(
        <NotificationDropdown parentRef={menuContentRef} menuProps={menuProps} queryRef={data} />
      )}
    </>
  )
}

export default TopBarNotifications
