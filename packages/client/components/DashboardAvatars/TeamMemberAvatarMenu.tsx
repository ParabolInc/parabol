import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuProps} from '../../hooks/useMenu'
import {TeamMemberAvatarMenu_teamMember} from '../../__generated__/TeamMemberAvatarMenu_teamMember.graphql'
import Menu from '../Menu'
import MenuItem from '../MenuItem'
import MenuItemLabel from '../MenuItemLabel'

interface Props {
  isLead: boolean
  isViewerLead: boolean
  teamMember: TeamMemberAvatarMenu_teamMember
  menuProps: MenuProps
  handleNavigate?: () => void
  togglePromote: () => void
  toggleRemove: () => void
  toggleLeave: () => void
}

const StyledLabel = styled(MenuItemLabel)({
  padding: '4px 16px'
})

const TeamMemberAvatarMenu = (props: Props) => {
  const {isViewerLead, teamMember, menuProps, togglePromote, toggleRemove, toggleLeave} = props
  const atmosphere = useAtmosphere()
  const {preferredName, userId} = teamMember
  const {viewerId} = atmosphere
  const isSelf = userId === viewerId

  return (
    <Menu ariaLabel={'Select what to do with this team member'} {...menuProps}>
      {isViewerLead && !isSelf && (
        <MenuItem
          key='promote'
          onClick={togglePromote}
          label={<StyledLabel>Promote {preferredName} to Team Lead</StyledLabel>}
        />
      )}
      {isViewerLead && !isSelf && (
        <MenuItem
          key='remove'
          onClick={toggleRemove}
          label={<StyledLabel>Remove {preferredName} from Team</StyledLabel>}
        />
      )}
      {!isViewerLead && isSelf && (
        <MenuItem key='leave' onClick={toggleLeave} label={<StyledLabel>Leave Team</StyledLabel>} />
      )}
    </Menu>
  )
}

export default createFragmentContainer(TeamMemberAvatarMenu, {
  teamMember: graphql`
    fragment TeamMemberAvatarMenu_teamMember on TeamMember {
      isSelf
      preferredName
      userId
      isLead
    }
  `
})
