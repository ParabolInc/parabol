import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import type {OrgTeamMemberMenu_teamMember$key} from '../../../../__generated__/OrgTeamMemberMenu_teamMember.graphql'
import Menu from '../../../../components/Menu'
import MenuItem from '../../../../components/MenuItem'
import MenuItemLabel from '../../../../components/MenuItemLabel'
import type {MenuProps} from '../../../../hooks/useMenu'

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
        userId
        isLead
      }
    `,
    teamMemberRef
  )
  const atmosphere = useAtmosphere()
  const {userId} = teamMember
  const {viewerId} = atmosphere
  const isSelf = userId === viewerId
  const isViewerTeamAdmin = isViewerLead || isViewerOrgAdmin

  return (
    <Menu ariaLabel={'Select your action'} {...menuProps}>
      {isViewerTeamAdmin && (!isSelf || !isViewerLead) && (
        <MenuItem
          label={<MenuItemLabel className='px-4 py-1'>Promote to Team Lead</MenuItemLabel>}
          key='promote'
          onClick={togglePromote}
        />
      )}
      {isViewerTeamAdmin && !isSelf && (
        <MenuItem
          label={<MenuItemLabel className='px-4 py-1'>Remove from Team</MenuItemLabel>}
          onClick={toggleRemove}
        />
      )}
    </Menu>
  )
}
