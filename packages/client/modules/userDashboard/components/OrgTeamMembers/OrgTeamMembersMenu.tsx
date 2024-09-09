import {MenuItem} from '@mui/material'
import React from 'react'
import IconLabel from '../../../../components/IconLabel'
import LinkButton from '../../../../components/LinkButton'
import Menu from '../../../../components/Menu'
import {MenuProps} from '../../../../hooks/useMenu'

interface OrgTeamMembersMenuProps {
  menuProps: MenuProps
  openDeleteTeamModal: () => void
}

export const OrgTeamMembersMenu = (props: OrgTeamMembersMenuProps) => {
  const {menuProps, openDeleteTeamModal} = props
  const {closePortal} = menuProps

  return (
    <Menu ariaLabel={'Select your action'} {...menuProps}>
      <MenuItem>
        <LinkButton
          aria-label='Click to permanently delete this team.'
          palette='red'
          onClick={() => {
            closePortal()
            openDeleteTeamModal()
          }}
        >
          <IconLabel icon='remove_circle' label='Delete Team' />
        </LinkButton>
      </MenuItem>
    </Menu>
  )
}
