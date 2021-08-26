import graphql from 'babel-plugin-relay/macro'
import React, {Fragment} from 'react'
import {createFragmentContainer} from 'react-relay'
import styled from '@emotion/styled'
import {ManageTeamList_team} from '../../../../__generated__/ManageTeamList_team.graphql'
import ManageTeamMember from './ManageTeamMember'

const List = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'scroll',
  paddingRight: 0,
  paddingTop: 0,
  position: 'relative',
  width: '100%',
  minHeight: 0 // required for FF68
})

interface Props {
  manageTeamMemberId?: string | null
  team: ManageTeamList_team
}

const ManageTeamList = (props: Props) => {
  const {manageTeamMemberId, team} = props
  const {isLead: isViewerLead, teamMembers} = team
  return (
    <List>
      {teamMembers.map((teamMember) => {
        return (
          <Fragment key={teamMember.id}>
            <ManageTeamMember
              isViewerLead={isViewerLead}
              manageTeamMemberId={manageTeamMemberId}
              teamMember={teamMember}
            />
          </Fragment>
        )
      })}
    </List>
  )
}

export default createFragmentContainer(ManageTeamList, {
  team: graphql`
    fragment ManageTeamList_team on Team {
      isLead
      teamMembers(sortBy: "preferredName") {
        id
        preferredName
        ...ManageTeamMember_teamMember
      }
    }
  `
})
