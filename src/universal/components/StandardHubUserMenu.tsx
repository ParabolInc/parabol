import {StandardHubUserMenu_viewer} from '__generated__/StandardHubUserMenu_viewer.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import DropdownMenuLabel from 'universal/components/DropdownMenuLabel'
import Menu from 'universal/components/Menu'
import MenuItem from 'universal/components/MenuItem'
import MenuItemHR from 'universal/components/MenuItemHR'
import MenuItemIcon from 'universal/components/MenuItemIcon'
import MenuItemLabel from 'universal/components/MenuItemLabel'
import {MenuProps} from 'universal/hooks/useMenu'
import ui from 'universal/styles/ui'
import {PERSONAL, PRO_LABEL, SIGNOUT_LABEL, SIGNOUT_SLUG} from 'universal/utils/constants'
import {PALETTE} from 'universal/styles/paletteV2'

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

export default createFragmentContainer(
  withRouter(StandardHubUserMenu),
  graphql`
    fragment StandardHubUserMenu_viewer on User {
      email
      organizations {
        id
        tier
      }
    }
  `
)
