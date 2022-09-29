import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {Link} from 'react-router-dom'
import {MenuProps} from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV3'
import {TierLabel} from '../types/constEnums'
import {SIGNOUT_LABEL, SIGNOUT_SLUG} from '../utils/constants'
import {StandardHubUserMenu_viewer$key} from '../__generated__/StandardHubUserMenu_viewer.graphql'
import DropdownMenuLabel from './DropdownMenuLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemHR from './MenuItemHR'
import MenuItemIcon from './MenuItemIcon'
import MenuItemLabel from './MenuItemLabel'

const UpgradeIcon = styled(MenuItemIcon)({
  color: PALETTE.SKY_500
})

const UpgradeCTA = styled('span')({
  color: PALETTE.SKY_500,
  fontSize: 15,
  lineHeight: '32px',
  marginRight: '2rem'
})

const TallMenu = styled(Menu)({
  maxHeight: 256
})

const MenuItemLink = MenuItemLabel.withComponent(Link)

interface Props {
  menuProps: MenuProps
  viewerRef: StandardHubUserMenu_viewer$key
}

const StandardHubUserMenu = (props: Props) => {
  const {menuProps, viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment StandardHubUserMenu_viewer on User {
        email
        featureFlags {
          insights
        }
        organizations {
          id
          tier
        }
      }
    `,
    viewerRef
  )
  const {email, featureFlags, organizations} = viewer
  const {insights} = featureFlags
  const ownedFreeOrgs = organizations.filter((org) => org.tier === 'personal')
  const showUpgradeCTA = ownedFreeOrgs.length > 0
  const routeSuffix = ownedFreeOrgs.length === 1 ? `/${ownedFreeOrgs[0]!.id}` : ''

  return (
    <TallMenu ariaLabel={'Select your settings'} {...menuProps}>
      <DropdownMenuLabel>{email}</DropdownMenuLabel>
      <MenuItem
        label={
          <MenuItemLink to={'/me/profile'}>
            <MenuItemIcon>account_box</MenuItemIcon>
            {'My Settings'}
          </MenuItemLink>
        }
      />
      <MenuItem
        label={
          <MenuItemLink to={'/me/organizations'}>
            <MenuItemIcon>account_balance</MenuItemIcon>
            {'Organizations'}
          </MenuItemLink>
        }
      />
      {insights && (
        <MenuItem
          label={
            <MenuItemLink to={'/usage'}>
              <MenuItemIcon>bar_chart</MenuItemIcon>
              {'Usage'}
            </MenuItemLink>
          }
        />
      )}
      {showUpgradeCTA && <MenuItemHR key='HR0' />}
      {showUpgradeCTA && (
        <MenuItem
          label={
            <MenuItemLink to={`/me/organizations${routeSuffix}`}>
              <UpgradeIcon>star</UpgradeIcon>
              <UpgradeCTA>
                {'Upgrade to '}
                <b>{TierLabel.PRO}</b>
              </UpgradeCTA>
            </MenuItemLink>
          }
        />
      )}
      <MenuItemHR key='HR1' />
      <MenuItem
        label={
          <MenuItemLink to={`/${SIGNOUT_SLUG}`}>
            <MenuItemIcon>exit_to_app</MenuItemIcon>
            {SIGNOUT_LABEL}
          </MenuItemLink>
        }
      />
    </TallMenu>
  )
}

export default StandardHubUserMenu
