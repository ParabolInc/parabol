import React, {useMemo} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {AssignFacilitator_newMeeting} from '../__generated__/AssignFacilitator_newMeeting.graphql'
import {AssignFacilitator_team} from '../__generated__/AssignFacilitator_team.graphql'
import withAtmosphere, {
  WithAtmosphereProps
} from '../decorators/withAtmosphere/withAtmosphere'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import lazyPreload from '../utils/lazyPreload'

const Control = styled('div')({
  fontWeight: 700
})

const DropdownControl = styled('div')({
  backgroundColor: 'yellow',
  borderRadius: 4
})

interface Props extends WithAtmosphereProps {
  isReadOnly?: boolean
  newMeeting?: AssignFacilitator_newMeeting
  team: AssignFacilitator_team
}

const AssignFacilitatorMenuRoot = lazyPreload(() =>
  import(/* webpackChunkName: 'AssignFacilitatorMenuRoot' */
  './AssignFacilitatorMenuRoot')
)

const AssignFacilitator = (props: Props) => {
  const {newMeeting, team} = props
  if (!newMeeting) return null
  const {teamMembers} = team
  const {facilitatorUserId} = newMeeting
  const currentFacilitator = useMemo(
    () => teamMembers.find((teamMember) => teamMember.userId === facilitatorUserId),
    [facilitatorUserId, teamMembers]
  )
  const {togglePortal, menuProps, menuPortal, originRef} = useMenu<HTMLDivElement>(MenuPosition.UPPER_RIGHT)
  console.log('--- team AssignFacilitator props ---')
  console.dir(team)
  console.log(facilitatorUserId, 'facilitatorUserId')
  return (
    <Control>
      Assign Facilitator
      <br />
      <br />
      <DropdownControl
        onMouseEnter={AssignFacilitatorMenuRoot.preload}
        onClick={togglePortal}
        ref={originRef}
      >
        Faciltator: {currentFacilitator!.preferredName}
      </DropdownControl>
      {menuPortal(<AssignFacilitatorMenuRoot menuProps={menuProps} team={team} newMeeting={newMeeting} />)}
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

export default createFragmentContainer(withAtmosphere(AssignFacilitator), {
  team: graphql`
    fragment AssignFacilitator_team on Team {
      ...AssignFacilitatorMenuRoot_team
      teamId: id
      teamMembers(sortBy: "checkInOrder") {
        id
        picture
        preferredName
        userId
      }
    }
  `,
  newMeeting: graphql`
    fragment AssignFacilitator_newMeeting on NewMeeting {
      ...AssignFacilitatorMenuRoot_newMeeting
      facilitatorUserId
    }
  `
})
