import {StandardHubUserMenu_viewer} from '../__generated__/StandardHubUserMenu_viewer.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import DropdownMenuLabel from './DropdownMenuLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemHR from './MenuItemHR'
import MenuItemIcon from './MenuItemIcon'
import MenuItemLabel from './MenuItemLabel'
import {MenuProps} from '../hooks/useMenu'
import ui from '../styles/ui'
import {PERSONAL, PRO_LABEL, SIGNOUT_LABEL, SIGNOUT_SLUG} from '../utils/constants'
import {PALETTE} from '../styles/paletteV2'

const UpgradeCTA = styled('span')({
  color: PALETTE.TEXT_BLUE,
  fontSize: ui.menuItemFontSize,
  lineHeight: ui.menuItemHeight,
  marginRight: '2rem'
})

const TallMenu = styled(Menu)({
  maxHeight: 256
})

interface Props extends RouteComponentProps<{}> {
  handleMenuClick: () => void
  menuProps: MenuProps
  viewer: StandardHubUserMenu_viewer
}

const StandardHubUserMenu = (props: Props) => {
  const {
    handleMenuClick,
    menuProps,
    history,
    viewer: {email, organizations}
  } = props

  // nav menu routes
  const goToProfile = () => {
    history.push('/me/profile')
    handleMenuClick()
  }
  const goToOrganizations = () => {
    history.push('/me/organizations')
    handleMenuClick()
  }
  const goToNotifications = () => {
    history.push('/me/notifications')
    handleMenuClick()
  }
  const signOut = () => {
    history.push(`/${SIGNOUT_SLUG}`)
    handleMenuClick()
  }

  const ownedFreeOrgs = organizations.filter((org) => org.tier === PERSONAL)
  const showUpgradeCTA = ownedFreeOrgs.length > 0

  const handleUpgradeClick = () => {
    const routeSuffix = ownedFreeOrgs.length === 1 ? `/${ownedFreeOrgs[0].id}` : ''
    history.push(`/me/organizations${routeSuffix}`)
  }

  return (
    <TallMenu ariaLabel={'Select your settings'} {...menuProps}>
      <DropdownMenuLabel>{email}</DropdownMenuLabel>
      <MenuItem
        label={
          <MenuItemLabel>
            <MenuItemIcon icon={'account_box'} />
            {'Profile'}
          </MenuItemLabel>
        }
        onClick={goToProfile}
      />
      <MenuItem
        label={
          <MenuItemLabel>
            <MenuItemIcon icon={'account_balance'} />
            {'Organizations'}
          </MenuItemLabel>
        }
        onClick={goToOrganizations}
      />
      <MenuItem
        label={
          <MenuItemLabel>
            <MenuItemIcon icon={'notifications'} />
            {'Notifications'}
          </MenuItemLabel>
        }
        onClick={goToNotifications}
      />
      {showUpgradeCTA && <MenuItemHR key='HR0' />}
      {showUpgradeCTA && (
        <MenuItem
          label={
            <MenuItemLabel>
              <MenuItemIcon icon={'star'} />
              <UpgradeCTA>
                {'Upgrade to '}
                <b>{PRO_LABEL}</b>
              </UpgradeCTA>
            </MenuItemLabel>
          }
          onClick={handleUpgradeClick}
        />
      )}
      <MenuItemHR key='HR1' />
      <MenuItem
        label={
          <MenuItemLabel>
            <MenuItemIcon icon={'exit_to_app'} />
            {SIGNOUT_LABEL}
          </MenuItemLabel>
        }
        onClick={signOut}
      />
    </TallMenu>
  )
}

export default createFragmentContainer(withRouter(StandardHubUserMenu), {
  viewer: graphql`
    fragment StandardHubUserMenu_viewer on User {
      email
      organizations {
        id
        tier
      }
    }
  `
})
