import {DashboardAvatars_team} from '__generated__/DashboardAvatars_team.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
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

const DashboardAvatars = (props: Props) => {
  const {team} = props
  const {isLead: isViewerLead, teamMembers} = team
  return (
    <AvatarsList>
      {teamMembers.map((teamMember) => {
        return (
          <AvatarItem key={`dbAvatar${teamMember.id}`}>
            <DashboardAvatar isViewerLead={isViewerLead} teamMember={teamMember} />
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
      ...AddTeamMemberAvatarButton_team
      teamMembers(sortBy: "preferredName") {
        ...AddTeamMemberAvatarButton_teamMembers
        ...DashboardAvatar_teamMember
        id
      }
    }
  `
)
