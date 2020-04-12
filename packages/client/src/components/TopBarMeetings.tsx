import graphql from 'babel-plugin-relay/macro'
import {MenuPosition} from 'parabol-client/src/hooks/useCoords'
import useMenu from 'parabol-client/src/hooks/useMenu'
import useSnacksForNewMeetings from 'parabol-client/src/hooks/useSnacksForNewMeetings'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import lazyPreload from 'parabol-client/src/utils/lazyPreload'
import {TopBarMeetings_teams} from 'parabol-client/src/__generated__/TopBarMeetings_teams.graphql'
import TopBarIcon from './TopBarIcon'

const SelectMeetingDropdown = lazyPreload(() =>
  import(
    /* webpackChunkName: 'SelectMeetingDropdown' */
    './SelectMeetingDropdown'
  )
)

interface Props {
  teams: TopBarMeetings_teams
}

const TopBarMeetings = (props: Props) => {
  const {teams} = props
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu<HTMLDivElement>(
    MenuPosition.UPPER_RIGHT
  )
  const activeMeetings = teams.flatMap((team) => team.activeMeetings)
  useSnacksForNewMeetings(activeMeetings)
  const hasMeetings = activeMeetings.length > 0
  return (
    <>
      <TopBarIcon
        ref={originRef}
        onClick={togglePortal}
        onMouseEnter={SelectMeetingDropdown.preload}
        icon={'forum'}
        hasBadge={hasMeetings}
      />
      {menuPortal(<SelectMeetingDropdown menuProps={menuProps} meetings={activeMeetings!} />)}
    </>
  )
}

graphql`
  fragment TopBarMeetingsActiveMeetings on Team {
    activeMeetings {
      ...SelectMeetingDropdown_meetings
      id
      createdAt
      facilitator {
        id
        preferredName
      }
      meetingType
      name
      team {
        name
      }
    }
    name
  }
`

export default createFragmentContainer(TopBarMeetings, {
  teams: graphql`
    fragment TopBarMeetings_teams on Team @relay(plural: true) {
      ...TopBarMeetingsActiveMeetings @relay(mask: false)
    }
  `
})
