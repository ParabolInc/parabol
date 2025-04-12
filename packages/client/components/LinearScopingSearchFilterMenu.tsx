import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {commitLocalUpdate, PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useSearchFilter from '~/hooks/useSearchFilter'
import getNonNullEdges from '~/utils/getNonNullEdges'
import SendClientSideEvent from '~/utils/SendClientSideEvent'
import {
  LinearScopingSearchFilterMenuQuery,
  LinearScopingSearchFilterMenuQuery$data
} from '../__generated__/LinearScopingSearchFilterMenuQuery.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import SearchQueryId from '../shared/gqlIds/SearchQueryId'
import getUniqueEdges from '../utils/getUniqueEdges'
import Checkbox from './Checkbox'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'
import {SearchMenuItem} from './SearchMenuItem'
import TypeAheadLabel from './TypeAheadLabel'

const StyledCheckBox = styled(Checkbox)({
  marginLeft: -8,
  marginRight: 8
})
const StyledMenuItemLabel = styled(MenuItemLabel)({})

const StyledMenu = styled(Menu)({
  maxWidth: '100%'
})

interface Props {
  menuProps: MenuProps
  queryRef: PreloadedQuery<LinearScopingSearchFilterMenuQuery>
}

const MAX_PROJECTS = 10

type LinearSearchQuery = NonNullable<
  NonNullable<
    LinearScopingSearchFilterMenuQuery['response']['viewer']['meeting']
  >['linearSearchQuery']
>

type ProjectEdge = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<
        LinearScopingSearchFilterMenuQuery$data['viewer']['teamMember']
      >['integrations']['linear']['api']
    >['query']
  >['allProjects']['edges']
>[number]

type Project = NonNullable<ProjectEdge['node']>

type TeamEdge = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<
        LinearScopingSearchFilterMenuQuery$data['viewer']['teamMember']
      >['integrations']['linear']['api']
    >['query']
  >['teams']['edges']
>[number]

type Team = NonNullable<TeamEdge['node']>

const linearProjectNameWithTeam = (project: Project) => {
  const {name: projectName, teams} = project
  const {displayName: teamName} = teams?.nodes?.[0] ?? {}
  return teamName ? `${teamName}/${projectName}` : `${projectName}`
}

const getNodeId = (edge: ProjectEdge) => {
  const {id} = edge.node
  return id
}

const getValue = (item: Project | Team) => {
  return 'teams' in item ? linearProjectNameWithTeam(item) : item.name || 'Unknown Project or Team'
}

const LinearScopingSearchFilterMenu = (props: Props) => {
  const {menuProps, queryRef} = props
  const query = usePreloadedQuery<LinearScopingSearchFilterMenuQuery>(
    graphql`
      query LinearScopingSearchFilterMenuQuery($teamId: ID!, $meetingId: ID!) {
        viewer {
          meeting(meetingId: $meetingId) {
            id
            ... on PokerMeeting {
              linearSearchQuery {
                selectedProjectsIds
                queryString
              }
            }
          }
          teamMember(teamId: $teamId) {
            integrations {
              linear {
                api {
                  query {
                    myProjects: projects(first: 100, filter: {members: {isMe: {eq: true}}}) {
                      edges {
                        node {
                          __typename
                          id
                          name
                          teams(first: 1) {
                            nodes {
                              displayName
                            }
                          }
                        }
                      }
                    }
                    allProjects: projects(first: 100) {
                      edges {
                        node {
                          __typename
                          id
                          name
                          teams(first: 1) {
                            nodes {
                              displayName
                            }
                          }
                        }
                      }
                    }
                    teams(first: 100) {
                      edges {
                        node {
                          __typename
                          id
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  )

  // Issues may be created on Projects or teams. We select the Projects the
  // user belongs to, followed by all Projects they have access to, followed
  // by teams. Null and duplicate edges are removed.
  const nullableProjectEdges = [
    ...(query.viewer.teamMember?.integrations.linear.api?.query?.myProjects?.edges ?? []),
    ...(query.viewer.teamMember?.integrations.linear.api?.query?.allProjects?.edges ?? [])
  ]
  const projects = useMemo(
    () => getUniqueEdges(getNonNullEdges(nullableProjectEdges), getNodeId).map(({node}) => node),
    [query]
  )
  const nullableTeamEdges =
    query.viewer.teamMember?.integrations.linear.api?.query?.teams?.edges ?? []
  const teams = useMemo(() => getNonNullEdges(nullableTeamEdges).map(({node}) => node), [query])
  const projectsAndTeams = useMemo(
    () => (projects as (Project | Team)[]).concat(teams as (Project | Team)[]),
    [query]
  )
  const meeting = query?.viewer?.meeting
  const meetingId = meeting?.id ?? ''
  const linearSearchQuery = meeting?.linearSearchQuery
  const {selectedProjectsIds} = linearSearchQuery!
  const atmosphere = useAtmosphere()

  const {
    query: searchQuery,
    filteredItems: filteredProjects,
    onQueryChange
  } = useSearchFilter(projectsAndTeams as (Project | Team)[], getValue)
  const visibleProjects = filteredProjects.slice(0, MAX_PROJECTS)

  const {portalStatus, isDropdown} = menuProps
  return (
    <StyledMenu
      keepParentFocus
      ariaLabel='Define the Linear search query'
      portalStatus={portalStatus}
      isDropdown={isDropdown}
    >
      <SearchMenuItem
        placeholder='Search Linear projects'
        onChange={onQueryChange}
        value={searchQuery}
      />
      {visibleProjects.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No projects found!</EmptyDropdownMenuItemLabel>
      )}
      {visibleProjects.map((node) => {
        const {id, __typename: nodeType} = node
        const selectionValue = `${nodeType}:${id}`
        const projectNameWithTeam = getValue(node)
        const isSelected = !!selectedProjectsIds?.includes(selectionValue)

        const handleClick = () => {
          commitLocalUpdate(atmosphere, (store) => {
            const searchQueryId = SearchQueryId.join('linear', meetingId)
            const linearSearchQuery = store.get<LinearSearchQuery>(searchQueryId)!
            const selectedProjectsIds = linearSearchQuery.getValue(
              'selectedProjectsIds'
            ) as string[]
            const newSelectedProjectsIds = isSelected
              ? selectedProjectsIds.filter((id) => id !== selectionValue)
              : [...selectedProjectsIds, selectionValue]
            linearSearchQuery.setValue(newSelectedProjectsIds, 'selectedProjectsIds')
          })
          SendClientSideEvent(atmosphere, 'Selected Poker Scope Project Filter', {
            meetingId,
            selectionValue,
            service: 'linear'
          })
        }
        return (
          <MenuItem
            key={selectionValue}
            label={
              <StyledMenuItemLabel>
                <StyledCheckBox active={isSelected} />
                <TypeAheadLabel query={searchQuery} label={projectNameWithTeam} />
              </StyledMenuItemLabel>
            }
            onClick={handleClick}
          />
        )
      })}
    </StyledMenu>
  )
}

export default LinearScopingSearchFilterMenu
