import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {TeamMemberAvatarMenu_teamMember$key} from '../../__generated__/TeamMemberAvatarMenu_teamMember.graphql'
import {MenuProps} from '../../hooks/useMenu'
import Menu from '../Menu'
import MenuItem from '../MenuItem'
import MenuItemLabel from '../MenuItemLabel'

interface Props {
  isLead: boolean
  isViewerLead: boolean
  isViewerOrgAdmin: boolean
  teamMember: TeamMemberAvatarMenu_teamMember$key
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
  const {
    isViewerLead,
    isViewerOrgAdmin,
    teamMember: teamMemberRef,
    menuProps,
    togglePromote,
    toggleRemove,
    toggleLeave
  } = props
  const teamMember = useFragment(
    graphql`
      fragment TeamMemberAvatarMenu_teamMember on TeamMember {
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
    <Menu ariaLabel={'Select what to do with this team member'} {...menuProps}>
      {isViewerTeamAdmin && (!isSelf || !isViewerLead) && (
        <MenuItem
          key='promote'
          onClick={togglePromote}
          label={<StyledLabel>Promote to Team Lead</StyledLabel>}
        />
      )}
      {isViewerTeamAdmin && !isSelf && (
        <MenuItem
          key='remove'
          onClick={toggleRemove}
          label={<StyledLabel>Remove from Team</StyledLabel>}
        />
      )}
      {!isViewerLead && isSelf && (
        <MenuItem key='leave' onClick={toggleLeave} label={<StyledLabel>Leave Team</StyledLabel>} />
      )}
    </Menu>
  )
}

export default TeamMemberAvatarMenu
