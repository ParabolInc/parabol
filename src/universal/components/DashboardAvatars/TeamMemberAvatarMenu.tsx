import {TeamMemberAvatarMenu_teamMember} from '__generated__/TeamMemberAvatarMenu_teamMember.graphql'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import DropdownMenuLabel from 'universal/components/DropdownMenuLabel'
import Menu from 'universal/components/Menu'
import MenuItem from 'universal/components/MenuItem'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import useModal from 'universal/hooks/useModal'
import lazyPreload from 'universal/utils/lazyPreload'
import MenuItemLabel from '../MenuItemLabel'

interface Props extends WithAtmosphereProps {
  isViewerLead: boolean
  teamMember: TeamMemberAvatarMenu_teamMember
  closePortal: () => void
  handleNavigate?: () => void
}

const PromoteTeamMemberModal = lazyPreload(() =>
  import(/* webpackChunkName: 'PromoteTeamMemberModal' */ 'universal/modules/teamDashboard/components/PromoteTeamMemberModal/PromoteTeamMemberModal')
)
const RemoveTeamMemberModal = lazyPreload(() =>
  import(/* webpackChunkName: 'RemoveTeamMemberModal' */ 'universal/modules/teamDashboard/components/RemoveTeamMemberModal/RemoveTeamMemberModal')
)
const LeaveTeamModal = lazyPreload(() =>
  import(/* webpackChunkName: 'LeaveTeamModal' */ 'universal/modules/teamDashboard/components/LeaveTeamModal/LeaveTeamModal')
)

const TeamMemberAvatarMenu = (props: Props) => {
  const {atmosphere, isViewerLead, teamMember, closePortal} = props
  const {user, preferredName, userId} = teamMember
  const {isConnected} = user
  const {viewerId} = atmosphere
  const isSelf = userId === viewerId
  const connected = isConnected ? 'connected' : 'disconnected'
  const hasOptions = (isViewerLead && !isSelf) || (!isViewerLead && isSelf)
  const {
    closePortal: closePromote,
    togglePortal: togglePromote,
    modalPortal: portalPromote
  } = useModal()
  const {
    closePortal: closeRemove,
    togglePortal: toggleRemove,
    modalPortal: portalRemove
  } = useModal()
  const {closePortal: closeLeave, togglePortal: toggleLeave, modalPortal: portalLeave} = useModal()
  return (
    <>
      <Menu ariaLabel={'Select what to do with this team member'} closePortal={closePortal}>
        <DropdownMenuLabel notMenuItem isEmpty={!hasOptions}>{`${
          isSelf ? 'You are' : `${preferredName} is`
        } ${connected}`}</DropdownMenuLabel>
        {isViewerLead && !isSelf && (
          <MenuItem
            key='promote'
            noCloseOnClick
            onClick={togglePromote}
            onMouseEnter={PromoteTeamMemberModal.preload}
            label={<MenuItemLabel>Promote {preferredName} to Team Lead</MenuItemLabel>}
          />
        )}
        {isViewerLead && !isSelf && (
          <MenuItem
            key='remove'
            noCloseOnClick
            onClick={toggleRemove}
            onMouseEnter={RemoveTeamMemberModal.preload}
            label={<MenuItemLabel>Remove {preferredName} from Team</MenuItemLabel>}
          />
        )}
        {!isViewerLead && isSelf && (
          <MenuItem
            key='leave'
            noCloseOnClick
            onClick={toggleLeave}
            onMouseEnter={LeaveTeamModal.preload}
            label={<MenuItemLabel>Leave Team</MenuItemLabel>}
          />
        )}
      </Menu>
      {portalPromote(<PromoteTeamMemberModal teamMember={teamMember} closePortal={closePromote} />)}
      {portalRemove(<RemoveTeamMemberModal teamMember={teamMember} closePortal={closeRemove} />)}
      {portalLeave(<LeaveTeamModal teamMember={teamMember} closePortal={closeLeave} />)}
    </>
  )
}

export default createFragmentContainer(
  withAtmosphere(TeamMemberAvatarMenu),
  graphql`
    fragment TeamMemberAvatarMenu_teamMember on TeamMember {
      isSelf
      preferredName
      userId
      isLead
      user {
        isConnected
      }
      ...LeaveTeamModal_teamMember
      ...PromoteTeamMemberModal_teamMember
      ...RemoveTeamMemberModal_teamMember
    }
  `
)
