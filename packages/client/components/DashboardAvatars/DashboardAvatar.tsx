import {DashboardAvatar_teamMember} from '../../__generated__/DashboardAvatar_teamMember.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Avatar from '../Avatar/Avatar'
import {MenuPosition} from '../../hooks/useCoords'
import useMenu from '../../hooks/useMenu'
import useModal from '../../hooks/useModal'
import lazyPreload from '../../utils/lazyPreload'
import defaultUserAvatar from '../../styles/theme/images/avatar-user.svg'

interface Props {
  isViewerLead: boolean
  teamMember: DashboardAvatar_teamMember
}

const AvatarAndTag = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  ':hover': {
    opacity: 0.5
  }
})

const TeamMemberAvatarMenu = lazyPreload(() =>
  import(/* webpackChunkName: 'TeamMemberAvatarMenu' */ './TeamMemberAvatarMenu')
)

const PromoteTeamMemberModal = lazyPreload(() =>
  import(
    /* webpackChunkName: 'PromoteTeamMemberModal' */ '../../modules/teamDashboard/components/PromoteTeamMemberModal/PromoteTeamMemberModal'
  )
)
const RemoveTeamMemberModal = lazyPreload(() =>
  import(
    /* webpackChunkName: 'RemoveTeamMemberModal' */ '../../modules/teamDashboard/components/RemoveTeamMemberModal/RemoveTeamMemberModal'
  )
)
const LeaveTeamModal = lazyPreload(() =>
  import(
    /* webpackChunkName: 'LeaveTeamModal' */ '../../modules/teamDashboard/components/LeaveTeamModal/LeaveTeamModal'
  )
)

const DashboardAvatar = (props: Props) => {
  const {isViewerLead, teamMember} = props
  const {isLead, picture} = teamMember
  const {user} = teamMember
  if (!user) {
    throw new Error(`User Avatar unavailable. ${JSON.stringify(teamMember)}`)
  }
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
        hasBadge
        isConnected={!!isConnected}
        onClick={togglePortal}
        picture={picture || defaultUserAvatar}
        ref={originRef}
        size={32}
      />
      {menuPortal(
        <TeamMemberAvatarMenu
          menuProps={menuProps}
          isLead={Boolean(isLead)}
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

export default createFragmentContainer(DashboardAvatar, {
  teamMember: graphql`
    fragment DashboardAvatar_teamMember on TeamMember {
      ...TeamMemberAvatarMenu_teamMember
      ...LeaveTeamModal_teamMember
      ...PromoteTeamMemberModal_teamMember
      ...RemoveTeamMemberModal_teamMember
      isLead
      picture
      user {
        isConnected
      }
    }
  `
})
