import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {useFragment} from 'react-relay'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import lazyPreload from '~/utils/lazyPreload'
import {TopBarNotifications_viewer$key} from '~/__generated__/TopBarNotifications_viewer.graphql'
import TopBarIcon from './TopBarIcon'

const NotificationDropdown = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'NotificationDropdown' */
      './NotificationDropdown'
    )
)

interface Props {
  viewerRef: TopBarNotifications_viewer$key
}

const TopBarNotifications = ({viewerRef}: Props) => {
  const data = useFragment(
    graphql`
      fragment TopBarNotifications_viewer on Query {
        ...NotificationDropdown_viewer
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
    viewerRef
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
        <NotificationDropdown parentRef={menuContentRef} menuProps={menuProps} viewerRef={data} />
      )}
    </>
  )
}

export default TopBarNotifications
