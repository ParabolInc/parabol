import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '../../styles/paletteV3'
import {Menu} from '../../ui/Menu/Menu'
import {MenuItem} from '../../ui/Menu/MenuItem'
import LeftDashNavItem from '../Dashboard/LeftDashNavItem'

const StyledLeftDashNavItem = styled(LeftDashNavItem)<{isViewerOnTeam: boolean}>(
  ({isViewerOnTeam}) => ({
    color: isViewerOnTeam ? PALETTE.SLATE_700 : PALETTE.SLATE_600,
    borderRadius: 44,
    paddingLeft: 15
  })
)

const DashNavMenu = () => {
  const handleMenuItemClick = () => {}
  return (
    <Menu
      side='right'
      align='center'
      sideOffset={20}
      trigger={
        <div>
          <StyledLeftDashNavItem
            className={'bg-transparent'}
            // onClick={handleClick}
            icon={'manageAccounts'}
            isViewerOnTeam
            // href={`/me/organizations/${org.id}/billing`}
            label={'Settings & Members'}
          />
        </div>
      }
    >
      <MenuItem onClick={handleMenuItemClick}>
        Plans & Billing •&nbsp;<span className='text-sky-500'>Upgrade</span>
      </MenuItem>
      <MenuItem onClick={handleMenuItemClick}>Teams</MenuItem>
      <MenuItem onClick={handleMenuItemClick}>Members</MenuItem>
      <MenuItem onClick={handleMenuItemClick}>Organization Settings</MenuItem>
      <MenuItem onClick={handleMenuItemClick}>Authentication</MenuItem>
    </Menu>
  )
}

export default DashNavMenu
