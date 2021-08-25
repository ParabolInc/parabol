import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import styled from '@emotion/styled'
import {ManageTeamList_team} from '../../../../__generated__/ManageTeamList_team.graphql'
import ManageTeamMember from './ManageTeamMember'

const RootStyles = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingRight: 0,
  paddingTop: 0,
  position: 'relative',
  width: '100%',
  minHeight: 0 // required for FF68
})

const AgendaListRoot = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  // react-beautiful-dnd supports scrolling on 1 parent
  // this is where we need it, in order to scroll a long list
  overflow: 'auto',
  paddingRight: 8,
  height: '100%', // trickle down height for overflow
  width: '100%'
})

interface Props {
  team: ManageTeamList_team
}

const ManageTeamList = (props: Props) => {
  const {team} = props
  const {teamMembers} = team

  return (
    <RootStyles>
      <AgendaListRoot>
        {teamMembers.map((teamMember) => {
          return (
            <div key={teamMember.id}>
              <ManageTeamMember teamMember={teamMember} />
            </div>
          )
        })}
      </AgendaListRoot>
    </RootStyles>
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
