import styled from '@emotion/styled'
import React from 'react'
import {useHistory} from 'react-router'
import {PALETTE} from '../../styles/paletteV3'
import {Menu} from '../../ui/Menu/Menu'
import {MenuContent} from '../../ui/Menu/MenuContent'
import {MenuItem} from '../../ui/Menu/MenuItem'
import LeftDashNavItem from '../Dashboard/LeftDashNavItem'

const StyledLeftDashNavItem = styled(LeftDashNavItem)<{isViewerOnTeam: boolean}>(
  ({isViewerOnTeam}) => ({
    color: isViewerOnTeam ? PALETTE.SLATE_700 : PALETTE.SLATE_600,
    borderRadius: 44,
    paddingLeft: 15
  })
)

type Props = {
  orgId: string
}

const DashNavMenu = (props: Props) => {
  const {orgId} = props
  const history = useHistory()
  const menuItems = [
    {
      label: (
        <>
          Plans & Billing •&nbsp;<span className='text-sky-500'>Upgrade</span>
        </>
      ),
      href: `/me/organizations/${orgId}/billing`
    },
    {
      label: 'Teams',
      href: `/me/organizations/${orgId}/teams`
    },
    {
      label: 'Members',
      href: `/me/organizations/${orgId}/members`
    },
    {
      label: 'Organization Settings',
      href: `/me/organizations/${orgId}/settings`
    },
    {
      label: 'Authentication',
      href: `/me/organizations/${orgId}/authentication`
    }
  ]

  const handleMenuItemClick = (href: string) => {
    history.push(href)
  }

  return (
    <Menu
      trigger={
        <div>
          <StyledLeftDashNavItem
            className={'bg-transparent'}
            icon={'manageAccounts'}
            isViewerOnTeam
            label={'Settings & Members'}
          />
        </div>
      }
    >
      <MenuContent side='right' align='center' sideOffset={20}>
        {menuItems.map((item) => (
          <MenuItem key={item.href} onClick={() => handleMenuItemClick(item.href)}>
            {item.label}
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  )
}

export default DashNavMenu
