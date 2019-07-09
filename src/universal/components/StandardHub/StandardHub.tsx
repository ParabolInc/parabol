import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {NavLink} from 'react-router-dom'
import Avatar from 'universal/components/Avatar/Avatar'
import Badge from 'universal/components/Badge/Badge'
import appTheme from 'universal/styles/theme/appTheme'
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg'
import ui from 'universal/styles/ui'
import styled, {css} from 'react-emotion'
import textOverflow from 'universal/styles/helpers/textOverflow'
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'
import {APP_BAR_HEIGHT} from 'universal/styles/appbars'
import useMenu from 'universal/hooks/useMenu'
import {MenuPosition} from 'universal/hooks/useCoords'
import lazyPreload from 'universal/utils/lazyPreload'
import {StandardHub_viewer} from '__generated__/StandardHub_viewer.graphql'

const StandardHubRoot = styled('div')({
  alignItems: 'center',
  borderBottom: ui.dashMenuBorder,
  display: 'flex',
  minHeight: APP_BAR_HEIGHT + 1, // add border
  padding: '.5625rem 1rem',
  width: '100%'
})

const User = styled('div')({
  display: 'flex',
  cursor: 'pointer',
  flex: 1,
  position: 'relative',
  transition: `opacity 100ms ease-in`,

  ':hover': {
    opacity: 0.5
  }
})

// Make a single clickable area, over user details, to trigger the menu
const MenuToggle = styled('div')({
  bottom: 0,
  left: 0,
  position: 'absolute',
  right: 0,
  top: 0
})

const PreferredName = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  fontSize: appTheme.typography.sBase,
  fontWeight: 600,
  maxWidth: '9rem',
  padding: '0 .25rem 0 1rem',
  '& > span': {...textOverflow}
})

const notificationsStyles = {
  alignItems: 'center',
  backgroundColor: ui.dashSidebarBackgroundColor,
  borderRadius: '2rem',
  display: 'flex',
  height: 32,
  justifyContent: 'center',
  position: 'relative' as 'relative',
  transition: `background-color 100ms ease-in`,
  width: 32,
  '&:hover,:focus': {
    backgroundColor: ui.navMenuDarkBackgroundColorHover
  }
}

const notificationsWithBadge = {
  backgroundColor: ui.navMenuDarkBackgroundColorHover
}

const notificationsActive = {
  backgroundColor: ui.navMenuDarkBackgroundColorActive,
  '&:hover,:focus': {
    backgroundColor: ui.navMenuDarkBackgroundColorActive
  }
}

const BadgeBlock = styled('div')({
  bottom: '-.375rem',
  position: 'absolute',
  right: '-.375rem'
})

const NotificationIcon = styled(Icon)({
  fontSize: MD_ICONS_SIZE_18,
  lineHeight: 'inherit',
  color: 'white'
})

const StandardHubUserMenu = lazyPreload(() =>
  import(/* webpackChunkName: 'StandardHubUserMenu' */ 'universal/components/StandardHubUserMenu')
)

interface Props {
  handleMenuClick: () => void
  viewer: StandardHub_viewer | null
}

const StandardHub = (props: Props) => {
  const {handleMenuClick, viewer} = props
  const notifications = viewer && viewer.notifications && viewer.notifications.edges
  const notificationsCount = notifications ? notifications.length : 0
  const {picture = '', preferredName = ''} = viewer || {}

  const navLinkStyles = css(notificationsStyles, notificationsCount > 0 && notificationsWithBadge)
  const userAvatar = picture || defaultUserAvatar
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_LEFT)
  return (
    <StandardHubRoot>
      <User>
        <Avatar hasBadge={false} picture={userAvatar} size={32} />
        <PreferredName>
          <span>{preferredName}</span>
        </PreferredName>
        <MenuToggle
          onClick={togglePortal}
          onMouseEnter={StandardHubUserMenu.preload}
          innerRef={originRef}
        />
        {menuPortal(
          <StandardHubUserMenu
            handleMenuClick={handleMenuClick}
            menuProps={menuProps}
            viewer={viewer!}
          />
        )}
      </User>
      <NavLink
        activeClassName={css(notificationsActive)}
        className={navLinkStyles}
        to='/me/notifications'
      >
        <NotificationIcon>notifications</NotificationIcon>
        {notificationsCount > 0 && (
          <BadgeBlock>
            <Badge value={notificationsCount} />
          </BadgeBlock>
        )}
      </NavLink>
    </StandardHubRoot>
  )
}

export default createFragmentContainer(
  StandardHub,
  graphql`
    fragment StandardHub_viewer on User {
      picture
      preferredName
      notifications(first: 100) @connection(key: "DashboardWrapper_notifications") {
        edges {
          node {
            id
          }
        }
      }
      ...StandardHubUserMenu_viewer
    }
  `
)
