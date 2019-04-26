import {DashboardAvatar_teamMember} from '__generated__/DashboardAvatar_teamMember.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import Avatar from 'universal/components/Avatar/Avatar'
import Tag from 'universal/components/Tag/Tag'
import {MenuPosition} from 'universal/hooks/useCoords'
import useMenu from 'universal/hooks/useMenu'
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

const DashboardAvatar = (props: Props) => {
  const {isViewerLead, teamMember} = props
  const {isLead, picture} = teamMember
  const {user} = teamMember
  const {isConnected} = user
  const {togglePortal, originRef, closePortal, menuPortal} = useMenu(MenuPosition.UPPER_RIGHT)
  return (
    <AvatarAndTag onMouseEnter={TeamMemberAvatarMenu.preload}>
      <Avatar
        {...teamMember}
        picture={picture || defaultUserAvatar}
        hasBadge
        innerRef={originRef}
        isCheckedIn={teamMember.isCheckedIn}
        isConnected={isConnected}
        isClickable
        onClick={togglePortal}
        size='smaller'
      />
      <AvatarTag colorPalette='blue' label='Team Lead' isLead={isLead} />
      {menuPortal(
        <TeamMemberAvatarMenu
          closePortal={closePortal}
          isViewerLead={isViewerLead}
          teamMember={teamMember}
        />
      )}
    </AvatarAndTag>
  )
}

export default createFragmentContainer(
  DashboardAvatar,
  graphql`
    fragment DashboardAvatar_teamMember on TeamMember {
      ...TeamMemberAvatarMenu_teamMember
      isCheckedIn
      isLead
      isSelf
      picture
      user {
        isConnected
      }
    }
  `
)
