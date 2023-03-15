import graphql from 'babel-plugin-relay/macro'
import React, {useMemo, useRef} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import useSearchFilter from '../hooks/useSearchFilter'
import {MeetingsDashTeamMenu_viewer} from '../__generated__/MeetingsDashTeamMenu_viewer.graphql'
import Atmosphere from '../Atmosphere'
import {MenuProps} from '../hooks/useMenu'
import {UserTaskViewFilterLabels} from '../types/constEnums'
import DropdownMenuLabel from './DropdownMenuLabel'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import {SearchMenuItem} from './SearchMenuItem'
import useAtmosphere from '../hooks/useAtmosphere'

interface Props {
  menuProps: MenuProps
  viewer: MeetingsDashTeamMenu_viewer | null
}

const setTeamFilter = (atmosphere: Atmosphere, teamId: string | null) => {
  commitLocalUpdate(atmosphere, (store) => {
    const viewer = store.getRoot().getLinkedRecord('viewer')
    if (!viewer) return
    if (!teamId) {
      viewer.setValue(null, 'teamFilter')
    }
    const team = store.get(teamId!)
    if (!team) return
    viewer.setLinkedRecord(team, 'teamFilter')
  })
}

const MeetingsDashTeamMenu = (props: Props) => {
  const {menuProps, viewer} = props
  const teamFilter = viewer?.teamFilter ?? null
  const oldTeamsRef = useRef<MeetingsDashTeamMenu_viewer['teams']>([])
  const nextTeams = viewer?.teams ?? oldTeamsRef.current
  if (nextTeams) {
    oldTeamsRef.current = nextTeams
  }
  const teams = oldTeamsRef.current
  const atmosphere = useAtmosphere()
  const defaultActiveIdx = useMemo(
    () =>
      teams.findIndex((team) => (teamFilter ? teamFilter.id === team.id : false)) +
      3 +
      (teams.length > 5 ? 1 : 0),
    [teamFilter]
  )

  const {
    query,
    filteredItems: matchedFilteredTeams,
    onQueryChange
  } = useSearchFilter(teams, (team) => team.name)

  return (
    <Menu
      keepParentFocus
      ariaLabel={'Select the team to filter by'}
      {...menuProps}
      defaultActiveIdx={defaultActiveIdx}
    >
      <DropdownMenuLabel>{'Filter by team:'}</DropdownMenuLabel>
      {teams.length > 5 && (
        <SearchMenuItem placeholder='Search teams' onChange={onQueryChange} value={query} />
      )}
      {query && matchedFilteredTeams.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No teams found!</EmptyDropdownMenuItemLabel>
      )}
      {query === '' && (
        <MenuItem
          key={'teamFilterNULL'}
          label={UserTaskViewFilterLabels.ALL_TEAMS}
          onClick={() => setTeamFilter(atmosphere, null)}
        />
      )}
      {matchedFilteredTeams.map((team) => (
        <MenuItem
          key={`teamFilter${team.id}`}
          dataCy={`team-filter-${team.id}`}
          label={team.name}
          onClick={() => setTeamFilter(atmosphere, team.id)}
        />
      ))}
    </Menu>
  )
}

export default createFragmentContainer(MeetingsDashTeamMenu, {
  viewer: graphql`
    fragment MeetingsDashTeamMenu_viewer on User {
      id
      teamFilter {
        id
      }
      teams {
        id
        name
      }
    }
  `
})
