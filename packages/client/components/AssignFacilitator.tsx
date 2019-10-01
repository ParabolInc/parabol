import React, {useMemo} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {AssignFacilitator_newMeeting} from '../__generated__/AssignFacilitator_newMeeting.graphql'
import {AssignFacilitator_team} from '../__generated__/AssignFacilitator_team.graphql'

const Control = styled('div')({
  fontWeight: 700
})

interface Props {
  newMeeting: AssignFacilitator_newMeeting
  team: AssignFacilitator_team
}

const AssignFacilitator = (props: Props) => {
  const {newMeeting, team} = props
  if (!newMeeting) return null
  const {teamMembers} = team
  const {facilitatorUserId} = newMeeting
  const currentFacilitator = useMemo(
    () => teamMembers.find((teamMember) => teamMember.userId === facilitatorUserId),
    [facilitatorUserId, teamMembers]
  )
  return (
    <Control>
      Assign Facilitator
      <br />
      <br />
      Faciltator: {currentFacilitator!.preferredName}
      <br />
      <br />
      {teamMembers.map((teamMember) => {
        return (
          <div key={teamMember.id}>
            {teamMember.preferredName}
            {teamMember.userId === facilitatorUserId && ', Facilitator!'}
          </div>
        )
      })}
    </Control>
  )
}

export default createFragmentContainer(AssignFacilitator, {
  team: graphql`
    fragment AssignFacilitator_team on Team {
      teamMembers(sortBy: "checkInOrder") {
        id
        preferredName
        userId
      }
    }
  `,
  newMeeting: graphql`
    fragment AssignFacilitator_newMeeting on NewMeeting {
      facilitatorUserId
    }
  `
})
