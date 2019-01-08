import {DashboardAvatar_teamMember} from '__generated__/DashboardAvatar_teamMember.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import Avatar from 'universal/components/Avatar/Avatar'
import defaultUserAvatar from '../../styles/theme/images/avatar-user.svg'
import Tag from 'universal/components/Tag/Tag'

interface Props {
  onClick: () => void
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

const DashboardAvatar = (props: Props) => {
  const {onClick, teamMember} = props
  const {isLead, picture} = teamMember
  return (
    <AvatarAndTag>
      <Avatar
        {...teamMember}
        picture={picture || defaultUserAvatar}
        hasBadge
        isCheckedIn={teamMember.isCheckedIn}
        isConnected={teamMember.isConnected || teamMember.isSelf}
        isClickable
        onClick={onClick}
        size='smaller'
      />
      <AvatarTag colorPalette='blue' label='Team Lead' isLead={isLead} />
    </AvatarAndTag>
  )
}

export default createFragmentContainer(
  DashboardAvatar,
  graphql`
    fragment DashboardAvatar_teamMember on TeamMember {
      isCheckedIn
      isConnected
      isLead
      isSelf
      picture
    }
  `
)
