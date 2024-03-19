import React from 'react'
import {MenuProps} from '../../../../hooks/useMenu'
import Menu from '../../../../components/Menu'
import MenuItem from '../../../../components/MenuItem'

interface OrgTeamMembersMenuProps {
  menuProps: MenuProps
  openDeleteTeamModal: () => void
}

export const OrgTeamMembersMenu = (props: OrgTeamMembersMenuProps) => {
  const {menuProps, openDeleteTeamModal} = props
  const {closePortal} = menuProps

  return (
    <Menu ariaLabel={'Select your action'} {...menuProps}>
      <MenuItem
        label='Delete team'
        onClick={() => {
          closePortal()
          openDeleteTeamModal()
        }}
      />
    </Menu>
  )
}
