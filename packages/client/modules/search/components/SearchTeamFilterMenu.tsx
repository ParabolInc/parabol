import CheckIcon from '@mui/icons-material/Check'
import graphql from 'babel-plugin-relay/macro'
import {useMemo, useRef} from 'react'
import {useFragment} from 'react-relay'
import type {
  SearchTeamFilterMenu_viewer$data,
  SearchTeamFilterMenu_viewer$key
} from '~/__generated__/SearchTeamFilterMenu_viewer.graphql'
import DropdownMenuLabel from '~/components/DropdownMenuLabel'
import {EmptyDropdownMenuItemLabel} from '~/components/EmptyDropdownMenuItemLabel'
import Menu from '~/components/Menu'
import MenuItem from '~/components/MenuItem'
import {SearchMenuItem} from '~/components/SearchMenuItem'
import useAtmosphere from '~/hooks/useAtmosphere'
import type {MenuProps} from '~/hooks/useMenu'
import useRouter from '~/hooks/useRouter'
import useSearchFilter from '~/hooks/useSearchFilter'
import {FilterLabels} from '~/types/constEnums'
import {useQueryParameterParser} from '~/utils/useQueryParameterParser'

interface Props {
  menuProps: MenuProps
  viewer: SearchTeamFilterMenu_viewer$key | null | undefined
}

const SearchTeamFilterMenu = (props: Props) => {
  const {history} = useRouter() // eslint-disable-line @typescript-eslint/no-unused-vars
  const {menuProps, viewer: viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment SearchTeamFilterMenu_viewer on User {
        id
        teams {
          id
          name
          teamMembers(sortBy: "preferredName") {
            userId
          }
        }
      }
    `,
    viewerRef
  )
  const oldTeamsRef = useRef<SearchTeamFilterMenu_viewer$data['teams']>([])
  const nextTeams = viewer?.teams ?? oldTeamsRef.current
  if (nextTeams) {
    oldTeamsRef.current = nextTeams
  }
  const teams = oldTeamsRef.current
  const atmosphere = useAtmosphere()
  const {teamIds, userIds} = useQueryParameterParser(atmosphere.viewerId)
  const showAllTeams = !!userIds
  const {filteredTeams, defaultActiveIdx} = useMemo(() => {
    const filteredTeams = userIds
      ? teams.filter(({teamMembers}) => !!teamMembers.find(({userId}) => userIds.includes(userId)))
      : teams
    return {
      filteredTeams,
      defaultActiveIdx:
        filteredTeams.findIndex((team) => teamIds?.includes(team.id)) +
        (showAllTeams ? 3 : 2) +
        (filteredTeams.length > 5 ? 1 : 0)
    }
  }, [userIds, teamIds])

  const {
    query,
    filteredItems: matchedFilteredTeams,
    onQueryChange
  } = useSearchFilter(filteredTeams, (team) => team.name)

  const {location} = useRouter() // Get location here to access current search params

  const handleTeamClick = (teamIds: string[] | null) => {
    const params = new URLSearchParams(location.search)
    if (teamIds && teamIds.length > 0) {
      params.set('teamIds', teamIds.join(','))
    } else {
      params.delete('teamIds')
    }
    history.push({
      pathname: location.pathname,
      search: params.toString()
    })
  }

  return (
    <Menu
      keepParentFocus
      ariaLabel={'Select the team to filter by'}
      {...menuProps}
      defaultActiveIdx={defaultActiveIdx}
      className='min-w-[240px]'
    >
      <DropdownMenuLabel>{'Filter by team:'}</DropdownMenuLabel>
      {filteredTeams.length > 5 && (
        <SearchMenuItem placeholder='Search teams' onChange={onQueryChange} value={query} />
      )}
      {query && matchedFilteredTeams.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No teams found!</EmptyDropdownMenuItemLabel>
      )}
      {query === '' && showAllTeams && (
        <MenuItem
          key={'teamFilterNULL'}
          label={
            <div className='flex w-full items-center justify-between px-4 py-1'>
              <span>{FilterLabels.ALL_TEAMS}</span>
              {(!teamIds || teamIds.length === 0) && <CheckIcon fontSize='small' />}
            </div>
          }
          onClick={() => handleTeamClick(null)}
        />
      )}
      {matchedFilteredTeams.map((team) => {
        const isSelected = teamIds?.includes(team.id)
        return (
          <MenuItem
            key={`teamFilter${team.id}`}
            dataCy={`team-filter-${team.id}`}
            noCloseOnClick
            label={
              <div className='flex w-full items-center justify-between px-4 py-1'>
                <span className='truncate'>{team.name}</span>
                {isSelected && <CheckIcon fontSize='small' />}
              </div>
            }
            onClick={() => {
              if (isSelected) {
                const newIds = teamIds?.filter((t) => t !== team.id)
                handleTeamClick(newIds && newIds.length > 0 ? newIds : null)
              } else {
                const newIds = [...(teamIds || []), team.id]
                handleTeamClick(newIds)
              }
            }}
          />
        )
      })}
    </Menu>
  )
}

export default SearchTeamFilterMenu
