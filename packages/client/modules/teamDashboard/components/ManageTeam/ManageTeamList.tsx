import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import styled from '@emotion/styled'
import {ManageTeamList_team} from '../../../../__generated__/ManageTeamList_team.graphql'
import ManageTeamMember from './ManageTeamMember'

const List = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingRight: 0,
  paddingTop: 0,
  position: 'relative',
  width: '100%',
  minHeight: 0 // required for FF68
})

interface Props {
  team: ManageTeamList_team
}

const ManageTeamList = (props: Props) => {
  const {team} = props
  const {teamMembers} = team

  return (
    <List>
      {teamMembers.map((teamMember) => {
        return (
          <div key={teamMember.id}>
            <ManageTeamMember teamMember={teamMember} />
          </div>
        )
      })}
    </List>
  )
}

export default createFragmentContainer(ManageTeamList, {
  team: graphql`
    fragment ManageTeamList_team on Team {
      teamMembers(sortBy: "preferredName") {
        id
        preferredName
        ...ManageTeamMember_teamMember
      }
    }
  `
})
