import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import Avatar from 'universal/components/Avatar/Avatar'
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg'
import styled from 'react-emotion'
import {DashboardAvatars_team} from '__generated__/DashboardAvatars_team.graphql'
import AddTeamMemberAvatarButton from '../AddTeamMemberAvatarButton'

const AvatarsList = styled('div')({
  display: 'flex',
  width: '100%'
})

const AvatarItem = styled('div')({
  margin: '0 0 0 1rem',
  position: 'relative'
})

interface Props {
  team: DashboardAvatars_team
}

const DashboardAvatars = (props: Props) => {
  const {
    team: {id: teamId, teamMembers}
  } = props
  return (
    <AvatarsList>
      {teamMembers.map((avatar) => {
        const picture = avatar.picture || defaultUserAvatar
        return (
          <AvatarItem key={`dbAvatar${avatar.id}`}>
            <Avatar
              {...avatar}
              picture={picture}
              hasBadge
              isCheckedIn={avatar.isCheckedIn}
              isConnected={avatar.isConnected || avatar.isSelf}
              size='smaller'
            />
          </AvatarItem>
        )
      })}
      <AddTeamMemberAvatarButton teamId={teamId} />
    </AvatarsList>
  )
}

export default createFragmentContainer(
  DashboardAvatars,
  graphql`
    fragment DashboardAvatars_team on Team {
      id
      teamMembers(sortBy: "preferredName") {
        id
        isCheckedIn
        isConnected
        isSelf
        picture
      }
    }
  `
)
