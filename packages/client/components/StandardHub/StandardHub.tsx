import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {NavLink} from 'react-router-dom'
import Avatar from '../Avatar/Avatar'
import Badge from '../Badge/Badge'
import defaultUserAvatar from '../../styles/theme/images/avatar-user.svg'
import styled from '@emotion/styled';
import textOverflow from '../../styles/helpers/textOverflow'
import Icon from '../Icon'
import {ICON_SIZE} from '../../styles/typographyV2'
import {PALETTE} from '../../styles/paletteV2'
import {APP_BAR_HEIGHT} from '../../styles/appbars'
import useMenu from '../../hooks/useMenu'
import {MenuPosition} from '../../hooks/useCoords'
import lazyPreload from '../../utils/lazyPreload'
import {StandardHub_viewer} from '../../__generated__/StandardHub_viewer.graphql'
import {ClassNames} from '@emotion/core'

const StandardHubRoot = styled('div')({
  alignItems: 'center',
  borderBottom: `1px solid ${PALETTE.BORDER_NAV_DARK}`,
  display: 'flex',
  minHeight: APP_BAR_HEIGHT + 1, // add border
  padding: '9px 16px',
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
  fontSize: 16,
  fontWeight: 600,
  maxWidth: '9rem',
  padding: '0 .25rem 0 1rem',
  '& > span': {...textOverflow}
})

const notificationsStyles = {
  alignItems: 'center',
  backgroundColor: PALETTE.BACKGROUND_PRIMARY,
  borderRadius: '2rem',
  display: 'flex',
  height: 32,
  justifyContent: 'center',
  position: 'relative' as 'relative',
  transition: `background-color 100ms ease-in`,
  width: 32,
  '&:hover,:focus': {
    backgroundColor: PALETTE.BACKGROUND_NAV_DARK_HOVER
  }
}

const notificationsWithBadge = {
  backgroundColor: PALETTE.BACKGROUND_NAV_DARK_HOVER
}

const notificationsActive = {
  backgroundColor: PALETTE.BACKGROUND_NAV_DARK_ACTIVE,
  '&:hover,:focus': {
    backgroundColor: PALETTE.BACKGROUND_NAV_DARK_ACTIVE
  }
}

const BadgeBlock = styled('div')({
  bottom: '-6px',
  position: 'absolute',
  right: '-6px'
})

const NotificationIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18,
  lineHeight: 'inherit',
  color: 'white'
})

const StandardHubUserMenu = lazyPreload(() =>
  import(/* webpackChunkName: 'StandardHubUserMenu' */ '../StandardHubUserMenu')
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

  const userAvatar = picture || defaultUserAvatar
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu<HTMLDivElement>(MenuPosition.UPPER_LEFT)
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
          ref={originRef}
        />
        {menuPortal(
          <StandardHubUserMenu
            handleMenuClick={handleMenuClick}
            menuProps={menuProps}
            viewer={viewer!}
          />
        )}
      </User>
      <ClassNames>
        {({css}) => {
          return (
            <NavLink
              activeClassName={css(notificationsActive)}
              className={css(notificationsStyles, notificationsCount > 0 && notificationsWithBadge)}
              to='/me/notifications'
            >
              <NotificationIcon>notifications</NotificationIcon>
              {notificationsCount > 0 && (
                <BadgeBlock>
                  <Badge>{notificationsCount}</Badge>
                </BadgeBlock>
              )}
            </NavLink>
          )
        }}
      </ClassNames>

    </StandardHubRoot>
  )
}

export default createFragmentContainer(StandardHub, {
  viewer: graphql`
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
})
