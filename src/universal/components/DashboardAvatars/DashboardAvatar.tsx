import {DashboardAvatar_teamMember} from '__generated__/DashboardAvatar_teamMember.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import Avatar from 'universal/components/Avatar/Avatar'
import Tag from 'universal/components/Tag/Tag'
import {MenuPosition} from 'universal/hooks/useCoords'
import useMenu from 'universal/hooks/useMenu'
import useModal from 'universal/hooks/useModal'
import lazyPreload from 'universal/utils/lazyPreload'
import defaultUserAvatar from '../../styles/theme/images/avatar-user.svg'

interface Props {
  isViewerLead: boolean
  teamMember: DashboardAvatar_teamMember
}

const AvatarAndTag = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
})
const AvatarTag = styled(Tag)(({isLead}: {isLead: boolean}) => ({
  bottom: '-1.5rem',
  marginLeft: 0,
  opacity: isLead ? 1 : 0,
  position: 'absolute',
  pointerEvents: 'none',
  transform: `scale(${isLead ? 1 : 0})`,
  transition: 'all 300ms',
  userSelect: 'none',
  whiteSpace: 'nowrap'
}))

const TeamMemberAvatarMenu = lazyPreload(() =>
  import(/* webpackChunkName: 'TeamMemberAvatarMenu' */ './TeamMemberAvatarMenu')
)

const PromoteTeamMemberModal = lazyPreload(() =>
  import(/* webpackChunkName: 'PromoteTeamMemberModal' */ 'universal/modules/teamDashboard/components/PromoteTeamMemberModal/PromoteTeamMemberModal')
)
const RemoveTeamMemberModal = lazyPreload(() =>
  import(/* webpackChunkName: 'RemoveTeamMemberModal' */ 'universal/modules/teamDashboard/components/RemoveTeamMemberModal/RemoveTeamMemberModal')
)
const LeaveTeamModal = lazyPreload(() =>
  import(/* webpackChunkName: 'LeaveTeamModal' */ 'universal/modules/teamDashboard/components/LeaveTeamModal/LeaveTeamModal')
)

const DashboardAvatar = (props: Props) => {
  const {isViewerLead, teamMember} = props
  const {isLead, picture} = teamMember
  const {user} = teamMember
  const {isConnected} = user
  const {togglePortal, originRef, menuProps, menuPortal} = useMenu(MenuPosition.UPPER_RIGHT)
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
    <AvatarAndTag onMouseEnter={TeamMemberAvatarMenu.preload}>
      <Avatar
        {...teamMember}
        picture={picture || defaultUserAvatar}
        hasBadge
        innerRef={originRef}
        isConnected={!!isConnected}
        onClick={togglePortal}
        size={32}
      />
      <AvatarTag colorPalette='blue' label='Team Lead' isLead={isLead} />
      {menuPortal(
        <TeamMemberAvatarMenu
          menuProps={menuProps}
          isViewerLead={isViewerLead}
          teamMember={teamMember}
          togglePromote={togglePromote}
          toggleRemove={toggleRemove}
          toggleLeave={toggleLeave}
        />
      )}
      {portalPromote(<PromoteTeamMemberModal teamMember={teamMember} closePortal={closePromote} />)}
      {portalRemove(<RemoveTeamMemberModal teamMember={teamMember} closePortal={closeRemove} />)}
      {portalLeave(<LeaveTeamModal teamMember={teamMember} closePortal={closeLeave} />)}
    </AvatarAndTag>
  )
}

export default createFragmentContainer(
  DashboardAvatar,
  graphql`
    fragment DashboardAvatar_teamMember on TeamMember {
      ...TeamMemberAvatarMenu_teamMember
      ...LeaveTeamModal_teamMember
      ...PromoteTeamMemberModal_teamMember
      ...RemoveTeamMemberModal_teamMember
      isLead
      isSelf
      picture
      user {
        isConnected
      }
    }
  `
)
