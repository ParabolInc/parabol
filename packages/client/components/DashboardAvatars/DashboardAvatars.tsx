import {DashboardAvatars_team} from '../../__generated__/DashboardAvatars_team.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import AddTeamMemberAvatarButton from '../AddTeamMemberAvatarButton'
import DashboardAvatar from './DashboardAvatar'

const AvatarsList = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end'
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

export default createFragmentContainer(DashboardAvatars, {
  team: graphql`
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
})
