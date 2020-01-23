import graphql from 'babel-plugin-relay/macro'
import {MenuPosition} from 'hooks/useCoords'
import useMenu from 'hooks/useMenu'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import lazyPreload from 'utils/lazyPreload'
import TopBarIcon from './TopBarIcon'
import {TopBarMeetings_teams} from '__generated__/TopBarMeetings_teams.graphql'

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
