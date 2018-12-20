import React, {lazy} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import Avatar from 'universal/components/Avatar/Avatar'
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg'
import styled from 'react-emotion'
import {DashboardAvatars_team} from '__generated__/DashboardAvatars_team.graphql'
import AddTeamMemberAvatarButton from '../AddTeamMemberAvatarButton'
import LoadableMenu from 'universal/components/LoadableMenu'

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

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
}

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
}

const TeamMemberAvatarMenu = lazy(() =>
  import(/* webpackChunkName: 'TeamMemberAvatarMenu' */ './TeamMemberAvatarMenu')
)

const DashboardAvatars = (props: Props) => {
  const {team} = props
  const {isLead: isViewerLead, teamMembers} = team
  return (
    <AvatarsList>
      {teamMembers.map((teamMember) => {
        const picture = teamMember.picture || defaultUserAvatar
        return (
          <AvatarItem key={`dbAvatar${teamMember.id}`}>
            <LoadableMenu
              LoadableComponent={TeamMemberAvatarMenu}
              maxWidth={400}
              maxHeight={225}
              originAnchor={originAnchor}
              queryVars={{
                isViewerLead,
                teamMember
              }}
              targetAnchor={targetAnchor}
              toggle={
                <Avatar
                  {...teamMember}
                  picture={picture}
                  hasBadge
                  isCheckedIn={teamMember.isCheckedIn}
                  isConnected={teamMember.isConnected || teamMember.isSelf}
                  isClickable
                  size='smaller'
                />
              }
            />
          </AvatarItem>
        )
      })}
      <AddTeamMemberAvatarButton team={team} teamMembers={teamMembers} />
    </AvatarsList>
  )
}

export default createFragmentContainer(
  DashboardAvatars,
  graphql`
    fragment DashboardAvatars_team on Team {
      id
      isLead
      ...AddTeamMemberModal_team
      teamMembers(sortBy: "preferredName") {
        ...AddTeamMemberModal_teamMembers
        ...TeamMemberAvatarMenu_teamMember
        id
        isCheckedIn
        isConnected
        isSelf
        picture
      }
    }
  `
)
