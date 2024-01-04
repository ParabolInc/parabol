import React from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV3'
import {Link} from 'react-router-dom'
import {MenuProps} from '../hooks/useMenu'
import {Star} from '@mui/icons-material'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemWithIcon from './MenuItemWithIcon'
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

interface Props {
  menuProps: MenuProps
  dataCy: string
}

const MenuItemLink = MenuItemLabel.withComponent(Link)

const TopBarSettingsMenu = (props: Props) => {
  const {menuProps, dataCy} = props

  return (
    <Menu ariaLabel={'How may we help?'} {...menuProps}>
      <MenuItem
        label={
          <MenuItemLink to={`/me/organizations`}>
            <MenuItemWithIcon dataCy={`${dataCy}`} label={'Organizations'} icon={'domain'} />
          </MenuItemLink>
        }
      />
      <MenuItem
        label={
          <MenuItemLink to={`/me/organizations`}>
            <UpgradeIcon>
              <Star />
            </UpgradeIcon>
            <UpgradeCTA>{'Upgrade'}</UpgradeCTA>
          </MenuItemLink>
        }
      />
    </Menu>
  )
}

export default TopBarSettingsMenu
