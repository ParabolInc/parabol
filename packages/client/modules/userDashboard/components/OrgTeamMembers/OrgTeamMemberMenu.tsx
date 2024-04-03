import styled from '@emotion/styled'
import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import useAtmosphere from '~/hooks/useAtmosphere'
import {useFragment} from 'react-relay'
import {MenuProps} from '../../../../hooks/useMenu'
import Menu from '../../../../components/Menu'
import MenuItem from '../../../../components/MenuItem'
import MenuItemLabel from '../../../../components/MenuItemLabel'
import {OrgTeamMemberMenu_teamMember$key} from '../../../../__generated__/OrgTeamMemberMenu_teamMember.graphql'

interface OrgTeamMemberMenuProps {
  isLead: boolean
  menuProps: MenuProps
  isViewerLead: boolean
  isViewerOrgAdmin: boolean
  manageTeamMemberId?: string | null
  teamMember: OrgTeamMemberMenu_teamMember$key
  handleNavigate?: () => void
  togglePromote: () => void
  toggleRemove: () => void
}

const StyledLabel = styled(MenuItemLabel)({
  padding: '4px 16px'
})

export const OrgTeamMemberMenu = (props: OrgTeamMemberMenuProps) => {
  const {
    isViewerLead,
    isViewerOrgAdmin,
    teamMember: teamMemberRef,
    menuProps,
    togglePromote,
    toggleRemove
  } = props
  const teamMember = useFragment(
    graphql`
      fragment OrgTeamMemberMenu_teamMember on TeamMember {
        isSelf
        preferredName
        userId
        isLead
      }
    `,
    teamMemberRef
  )
  const atmosphere = useAtmosphere()
  const {preferredName, userId} = teamMember
  const {viewerId} = atmosphere
  const isSelf = userId === viewerId
  const isViewerTeamAdmin = isViewerLead || isViewerOrgAdmin

  return (
    <Menu ariaLabel={'Select your action'} {...menuProps}>
      {isViewerTeamAdmin && (!isSelf || !isViewerLead) && (
        <MenuItem
          label={<StyledLabel>Promote {preferredName} to Team Lead</StyledLabel>}
          key='promote'
          onClick={togglePromote}
        />
      )}
      {isViewerTeamAdmin && !isSelf && (
        <MenuItem
          label={<StyledLabel>Remove {preferredName} from Team</StyledLabel>}
          onClick={toggleRemove}
        />
      )}
    </Menu>
  )
}
