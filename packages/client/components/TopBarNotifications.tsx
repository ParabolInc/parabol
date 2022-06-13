import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {useFragment} from 'react-relay'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import lazyPreload from '~/utils/lazyPreload'
import {TopBarNotifications_query$key} from '~/__generated__/TopBarNotifications_query.graphql'
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
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu<HTMLDivElement>(
    MenuPosition.UPPER_RIGHT,
    {menuContentRef}
  )
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
