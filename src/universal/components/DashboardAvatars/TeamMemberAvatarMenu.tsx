import {TeamMemberAvatarMenu_teamMember} from '__generated__/TeamMemberAvatarMenu_teamMember.graphql'
import React, {lazy} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import DropdownMenuLabel from 'universal/components/DropdownMenuLabel'
import MenuItemWithShortcuts from 'universal/components/MenuItemWithShortcuts'
import MenuWithShortcuts from 'universal/components/MenuWithShortcuts'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import LoadableModal from '../LoadableModal'
import MenuItemLabel from '../MenuItemLabel'

interface Props extends WithAtmosphereProps {
  isViewerLead: boolean
  teamMember: TeamMemberAvatarMenu_teamMember
  closePortal: () => void
  handleNavigate?: () => void
}

const PromoteTeamMemberModal = lazy(() =>
  import(/* webpackChunkName: 'PromoteTeamMemberModal' */ 'universal/modules/teamDashboard/components/PromoteTeamMemberModal/PromoteTeamMemberModal')
)
const RemoveTeamMemberModal = lazy(() =>
  import(/* webpackChunkName: 'RemoveTeamMemberModal' */ 'universal/modules/teamDashboard/components/RemoveTeamMemberModal/RemoveTeamMemberModal')
)
const LeaveTeamModal = lazy(() =>
  import(/* webpackChunkName: 'LeaveTeamModal' */ 'universal/modules/teamDashboard/components/LeaveTeamModal/LeaveTeamModal')
)

const TeamMemberAvatarMenu = (props: Props) => {
  const {atmosphere, isViewerLead, teamMember, closePortal} = props
  const {isConnected, preferredName, userId} = teamMember
  const {viewerId} = atmosphere
  const isSelf = userId === viewerId
  const connected = isConnected ? 'connected' : 'disconnected'
  const hasOptions = (isViewerLead && !isSelf) || (!isViewerLead && isSelf)
  return (
    <MenuWithShortcuts
      ariaLabel={'Select what to do with this team member'}
      closePortal={closePortal}
    >
      <DropdownMenuLabel isEmpty={!hasOptions}>{`${
        isSelf ? 'You are' : `${preferredName} is`
      } ${connected}`}</DropdownMenuLabel>
      {isViewerLead &&
        !isSelf && (
          <MenuItemWithShortcuts key='promote' noCloseOnClick>
            <LoadableModal
              LoadableComponent={PromoteTeamMemberModal}
              queryVars={{teamMember}}
              toggle={<MenuItemLabel>Promote {preferredName} to Team Lead</MenuItemLabel>}
            />
          </MenuItemWithShortcuts>
        )}
      {isViewerLead &&
        !isSelf && (
          <MenuItemWithShortcuts key='remove' noCloseOnClick>
            <LoadableModal
              LoadableComponent={RemoveTeamMemberModal}
              queryVars={{teamMember}}
              toggle={<MenuItemLabel>Remove {preferredName} from Team</MenuItemLabel>}
            />
          </MenuItemWithShortcuts>
        )}
      {!isViewerLead &&
        isSelf && (
          <MenuItemWithShortcuts key='leave' noCloseOnClick>
            <LoadableModal
              LoadableComponent={LeaveTeamModal}
              queryVars={{teamMember}}
              toggle={<MenuItemLabel>Leave Team</MenuItemLabel>}
            />
          </MenuItemWithShortcuts>
        )}
    </MenuWithShortcuts>
  )
}

export default createFragmentContainer(
  withAtmosphere(TeamMemberAvatarMenu),
  graphql`
    fragment TeamMemberAvatarMenu_teamMember on TeamMember {
      isConnected
      isSelf
      preferredName
      userId
      isLead
      ...LeaveTeamModal_teamMember
      ...PromoteTeamMemberModal_teamMember
      ...RemoveTeamMemberModal_teamMember
    }
  `
)
