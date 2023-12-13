import React from 'react'
import {MenuProps} from '../../../../hooks/useMenu'
import Menu from '../../../../components/Menu'
import MenuItem from '../../../../components/MenuItem'

interface OrgTeamMembersMenuProps {
  menuProps: MenuProps
}

export const OrgTeamMembersMenu = (props: OrgTeamMembersMenuProps) => {
  const {menuProps} = props

  return (
    <Menu ariaLabel={'Select your action'} {...menuProps}>
      <MenuItem label='Delete team' />
    </Menu>
  )
}
