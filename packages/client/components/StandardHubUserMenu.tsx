import styled from '@emotion/styled'
import {AccountBalance, AccountBox, BarChart, ExitToApp, Star} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
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

  const {t} = useTranslation()

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
  const routeSuffix =
    ownedFreeOrgs.length === 1
      ? t('StandardHubUserMenu.OwnedFreeOrgs0Id', {
          ownedFreeOrgs0Id: ownedFreeOrgs[0]!.id
        })
      : ''

  return (
    <TallMenu ariaLabel={t('StandardHubUserMenu.SelectYourSettings')} {...menuProps}>
      <DropdownMenuLabel>{email}</DropdownMenuLabel>
      <MenuItem
        label={
          <MenuItemLink to={t('StandardHubUserMenu.MeProfile')}>
            <MenuItemIcon>
              <AccountBox />
            </MenuItemIcon>
            {t('StandardHubUserMenu.Profile')}
          </MenuItemLink>
        }
      />
      <MenuItem
        label={
          <MenuItemLink to={t('StandardHubUserMenu.MeOrganizations')}>
            <MenuItemIcon>
              <AccountBalance />
            </MenuItemIcon>
            {t('StandardHubUserMenu.Organizations')}
          </MenuItemLink>
        }
      />
      {insights && (
        <MenuItem
          label={
            <MenuItemLink to={t('StandardHubUserMenu.Usage')}>
              <MenuItemIcon>
                <BarChart />
              </MenuItemIcon>
              {t('StandardHubUserMenu.Usage')}
            </MenuItemLink>
          }
        />
      )}
      {showUpgradeCTA && <MenuItemHR key='HR0' />}
      {showUpgradeCTA && (
        <MenuItem
          label={
            <MenuItemLink
              to={t('StandardHubUserMenu.MeOrganizationsRouteSuffix', {
                routeSuffix
              })}
            >
              <UpgradeIcon>
                <Star />
              </UpgradeIcon>
              <UpgradeCTA>
                {t('StandardHubUserMenu.UpgradeTo')}
                <b>{TierLabel.PRO}</b>
              </UpgradeCTA>
            </MenuItemLink>
          }
        />
      )}
      <MenuItemHR key='HR1' />
      <MenuItem
        label={
          <MenuItemLink
            to={t('StandardHubUserMenu.SignoutSlug', {
              signoutSlug: SIGNOUT_SLUG
            })}
          >
            <MenuItemIcon>
              <ExitToApp />
            </MenuItemIcon>
            {SIGNOUT_LABEL}
          </MenuItemLink>
        }
      />
    </TallMenu>
  )
}

export default StandardHubUserMenu
