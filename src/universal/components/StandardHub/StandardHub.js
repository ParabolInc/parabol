import PropTypes from 'prop-types'
import React from 'react'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import {createFragmentContainer} from 'react-relay'
import {NavLink} from 'react-router-dom'
import Avatar from 'universal/components/Avatar/Avatar'
import Badge from 'universal/components/Badge/Badge'
import appTheme from 'universal/styles/theme/appTheme'
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg'
import ui from 'universal/styles/ui'
import styled, {css} from 'react-emotion'
import LoadableStandardHubUserMenu from 'universal/components/LoadableStandardHubUserMenu'
import LoadableMenu from 'universal/components/LoadableMenu'
import textOverflow from 'universal/styles/helpers/textOverflow'

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'left'
}

const targetAnchor = {
  vertical: 'top',
  horizontal: 'left'
}

const StandardHubRoot = styled('div')({
  alignItems: 'center',
  borderBottom: ui.dashMenuBorder,
  display: 'flex',
  minHeight: ui.dashHeaderMinHeight,
  padding: '.5625rem 1rem',
  width: '100%'
})

const User = styled('div')({
  display: 'flex',
  cursor: 'pointer',
  flex: 1,
  position: 'relative',
  transition: `opacity ${ui.transition[0]}`,

  ':hover': {
    opacity: '.5'
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
  position: 'relative',
  transition: `background-color ${ui.transition[0]}`,
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

const NotificationIcon = styled(StyledFontAwesome)({
  lineHeight: 'inherit',
  color: 'white'
})

const StandardHub = (props) => {
  const {viewer} = props
  const notifications = viewer && viewer.notifications && viewer.notifications.edges
  const notificationsCount = notifications ? notifications.length : 0
  const {picture = '', preferredName = ''} = viewer || {}

  const navLinkStyles = css(notificationsStyles, notificationsCount > 0 && notificationsWithBadge)
  const userAvatar = picture || defaultUserAvatar

  return (
    <StandardHubRoot>
      <User>
        <Avatar hasBadge={false} picture={userAvatar} size='smaller' />
        <PreferredName>
          <span>{preferredName}</span>
        </PreferredName>
        <LoadableMenu
          LoadableComponent={LoadableStandardHubUserMenu}
          maxWidth={450}
          maxHeight={275}
          originAnchor={originAnchor}
          queryVars={{
            viewer
          }}
          targetAnchor={targetAnchor}
          toggle={<MenuToggle />}
        />
      </User>
      <NavLink
        activeClassName={css(notificationsActive)}
        className={navLinkStyles}
        to='/me/notifications'
      >
        <NotificationIcon name='bell' />
        {notificationsCount > 0 && (
          <BadgeBlock>
            <Badge value={notificationsCount} />
          </BadgeBlock>
        )}
      </NavLink>
    </StandardHubRoot>
  )
}

StandardHub.propTypes = {
  notificationsCount: PropTypes.number,
  viewer: PropTypes.object
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
