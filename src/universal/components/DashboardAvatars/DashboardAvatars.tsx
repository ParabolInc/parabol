import {DashboardAvatars_team} from '__generated__/DashboardAvatars_team.graphql'
import React, {lazy} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import LoadableMenu from 'universal/components/LoadableMenu'
import AddTeamMemberAvatarButton from '../AddTeamMemberAvatarButton'
import DashboardAvatar from './DashboardAvatar'

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
              toggle={<DashboardAvatar teamMember={teamMember} />}
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
        ...DashboardAvatar_teamMember
        id
      }
    }
  `
)
