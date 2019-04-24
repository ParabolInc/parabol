import React from 'react'
import MenuWithShortcuts from 'universal/components/MenuWithShortcuts'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import MenuItemWithShortcuts from 'universal/components/MenuItemWithShortcuts'
import MenuItemHR from 'universal/components/MenuItemHR'
import {createFragmentContainer} from 'react-relay'
import type {RouterHistory} from 'react-router-dom'
import {withRouter} from 'react-router-dom'
import {PERSONAL, PRO_LABEL, SIGNOUT_LABEL, SIGNOUT_SLUG} from 'universal/utils/constants'
import DropdownMenuLabel from 'universal/components/DropdownMenuLabel'

const UpgradeCTA = styled('span')({
  color: ui.upgradeColor,
  fontSize: ui.menuItemFontSize,
  lineHeight: ui.menuItemHeight,
  marginRight: '2rem'
})

type Props = {|
  closePortal: () => void,
  history: RouterHistory,
  viewer: any
|}
const StandardHubUserMenu = (props: Props) => {
  const {
    closePortal,
    history,
    viewer: {email, organizations}
  } = props

  // nav menu routes
  const goToProfile = () => history.push('/me/profile')
  const goToOrganizations = () => history.push('/me/organizations')
  const goToNotifications = () => history.push('/me/notifications')
  const signOut = () => history.push(`/${SIGNOUT_SLUG}`)

  const ownedFreeOrgs = organizations.filter((org) => org.tier === PERSONAL)
  const showUpgradeCTA = ownedFreeOrgs.length > 0

  const makeUpgradeMenuLabel = (
    <UpgradeCTA>
      {'Upgrade to '}
      <b>{PRO_LABEL}</b>
    </UpgradeCTA>
  )

  const handleUpgradeClick = () => {
    const routeSuffix = ownedFreeOrgs.length === 1 ? `/${ownedFreeOrgs[0].id}` : ''
    history.push(`/me/organizations${routeSuffix}`)
  }

  return (
    <MenuWithShortcuts ariaLabel={'Select your settings'} closePortal={closePortal}>
      <DropdownMenuLabel>{email}</DropdownMenuLabel>
      <MenuItemWithShortcuts icon='account_box' label='Profile' onClick={goToProfile} />
      <MenuItemWithShortcuts
        icon='account_balance'
        label='Organizations'
        onClick={goToOrganizations}
      />
      <MenuItemWithShortcuts
        icon='notifications'
        label='Notifications'
        onClick={goToNotifications}
      />
      {showUpgradeCTA && <MenuItemHR key='HR0' notMenuItem />}
      {showUpgradeCTA && (
        <MenuItemWithShortcuts
          icon='star'
          label={makeUpgradeMenuLabel}
          onClick={handleUpgradeClick}
        />
      )}
      <MenuItemHR key='HR1' notMenuItem />
      <MenuItemWithShortcuts icon='exit_to_app' label={SIGNOUT_LABEL} onClick={signOut} />
    </MenuWithShortcuts>
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
